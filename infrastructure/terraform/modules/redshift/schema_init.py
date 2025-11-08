import json
import boto3
import os
import time

def handler(event, context):
    """Initialize Redshift schema with observation tables"""
    
    cluster_id = os.environ['CLUSTER_IDENTIFIER']
    database = os.environ['DATABASE_NAME']
    secret_arn = os.environ['SECRET_ARN']
    
    # Get credentials from Secrets Manager
    secrets_client = boto3.client('secretsmanager')
    secret = json.loads(secrets_client.get_secret_value(SecretId=secret_arn)['SecretString'])
    
    # Redshift Data API client
    redshift_data = boto3.client('redshift-data')
    
    # Schema creation SQL
    schema_sql = """
    -- Create schema
    CREATE SCHEMA IF NOT EXISTS aim_observations;
    
    -- Observation staging table (from MSK)
    CREATE TABLE IF NOT EXISTS aim_observations.observation_staging (
        vin_hash VARCHAR(64) NOT NULL,
        lane_id VARCHAR(255) NOT NULL,
        timestamp TIMESTAMP NOT NULL,
        bid_count INTEGER,
        top_bid DECIMAL(10, 2),
        cr_score DECIMAL(5, 2),
        bidder_count INTEGER,
        bidder_hashes TEXT,  -- JSON array as text
        bid_time_spread_sec DECIMAL(10, 2),
        suspicious_activity_score DECIMAL(5, 2),
        platform VARCHAR(50) NOT NULL,
        ingestion_timestamp TIMESTAMP DEFAULT GETDATE(),
        PRIMARY KEY (vin_hash, lane_id, timestamp, platform)
    ) DISTKEY(vin_hash) SORTKEY(timestamp, platform);
    
    -- Deduplicated observations table
    CREATE TABLE IF NOT EXISTS aim_observations.observations (
        vin_hash VARCHAR(64) NOT NULL,
        lane_id VARCHAR(255) NOT NULL,
        timestamp TIMESTAMP NOT NULL,
        bid_count INTEGER,
        top_bid DECIMAL(10, 2),
        cr_score DECIMAL(5, 2),
        bidder_count INTEGER,
        bidder_hashes TEXT,
        bid_time_spread_sec DECIMAL(10, 2),
        suspicious_activity_score DECIMAL(5, 2),
        platform VARCHAR(50) NOT NULL,
        observation_id BIGINT IDENTITY(1,1),
        created_at TIMESTAMP DEFAULT GETDATE(),
        PRIMARY KEY (observation_id)
    ) DISTKEY(vin_hash) SORTKEY(timestamp, platform);
    
    -- VIN features table (from feature builder)
    CREATE TABLE IF NOT EXISTS aim_observations.vin_features (
        vin_hash VARCHAR(64) NOT NULL,
        feature_timestamp TIMESTAMP NOT NULL,
        market_sentiment_score DECIMAL(5, 2),
        competitor_pricing DECIMAL(10, 2),
        historical_trend DECIMAL(5, 2),
        feature_vector TEXT,  -- JSON array
        created_at TIMESTAMP DEFAULT GETDATE(),
        PRIMARY KEY (vin_hash, feature_timestamp)
    ) DISTKEY(vin_hash) SORTKEY(feature_timestamp);
    
    -- Model outputs table
    CREATE TABLE IF NOT EXISTS aim_observations.model_outputs (
        vin_hash VARCHAR(64) NOT NULL,
        model_timestamp TIMESTAMP NOT NULL,
        base_value DECIMAL(10, 2),
        confidence_band DECIMAL(5, 2),
        adjusted_value DECIMAL(10, 2),
        offer_value DECIMAL(10, 2),
        confidence DECIMAL(5, 2),
        valid_days INTEGER,
        model_version VARCHAR(50),
        created_at TIMESTAMP DEFAULT GETDATE(),
        PRIMARY KEY (vin_hash, model_timestamp)
    ) DISTKEY(vin_hash) SORTKEY(model_timestamp);
    
    -- Bidder velocity index table
    CREATE TABLE IF NOT EXISTS aim_observations.bidder_velocity (
        bidder_hash VARCHAR(64) NOT NULL,
        platform VARCHAR(50) NOT NULL,
        avg_bid_time_spread_sec DECIMAL(10, 2),
        velocity_z_score DECIMAL(10, 4),
        flagged BOOLEAN DEFAULT FALSE,
        last_updated TIMESTAMP DEFAULT GETDATE(),
        PRIMARY KEY (bidder_hash, platform)
    ) DISTKEY(bidder_hash) SORTKEY(platform);
    
    -- VIN graph relationships (for Neptune migration later)
    CREATE TABLE IF NOT EXISTS aim_observations.vin_graph_edges (
        source_vin_hash VARCHAR(64) NOT NULL,
        target_vin_hash VARCHAR(64),
        target_bidder_hash VARCHAR(64),
        relationship_type VARCHAR(50),
        weight DECIMAL(5, 2),
        created_at TIMESTAMP DEFAULT GETDATE()
    ) DISTKEY(source_vin_hash) SORTKEY(created_at);
    
    -- Grant permissions
    GRANT USAGE ON SCHEMA aim_observations TO PUBLIC;
    GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA aim_observations TO PUBLIC;
    """
    
    # Execute schema creation
    try:
        response = redshift_data.execute_statement(
            ClusterIdentifier=cluster_id,
            Database=database,
            DbUser=secret['username'],
            Sql=schema_sql
        )
        
        statement_id = response['Id']
        
        # Wait for completion
        while True:
            status = redshift_data.describe_statement(Id=statement_id)
            if status['Status'] in ['FINISHED', 'FAILED', 'ABORTED']:
                break
            time.sleep(2)
        
        if status['Status'] == 'FINISHED':
            return {
                'statusCode': 200,
                'body': json.dumps({'message': 'Schema created successfully'})
            }
        else:
            return {
                'statusCode': 500,
                'body': json.dumps({'error': f"Schema creation failed: {status.get('Error', 'Unknown error')}"})
            }
            
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
