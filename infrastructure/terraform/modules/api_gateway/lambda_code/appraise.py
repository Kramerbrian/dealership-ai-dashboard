import json
import boto3
import os
from datetime import datetime

def handler(event, context):
    """Generate guaranteed offer for a VIN"""
    
    try:
        body = json.loads(event.get('body', '{}'))
        vin = body.get('vin')
        
        if not vin:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'VIN is required'})
            }
        
        # Get valuation from Redshift
        redshift_data = boto3.client('redshift-data')
        cluster_id = os.environ['REDSHIFT_CLUSTER_ID']
        database = os.environ['REDSHIFT_DATABASE']
        secret_arn = os.environ['REDSHIFT_SECRET_ARN']
        
        # Query latest model output
        query = f"""
        SELECT offer_value, confidence, valid_days, confidence_band
        FROM aim_observations.model_outputs
        WHERE vin_hash = SHA256('{vin}')
        ORDER BY model_timestamp DESC
        LIMIT 1
        """
        
        response = redshift_data.execute_statement(
            ClusterIdentifier=cluster_id,
            Database=database,
            DbUser='aim_admin',
            Sql=query,
            SecretArn=secret_arn
        )
        
        # Get results
        result = redshift_data.get_statement_result(Id=response['Id'])
        
        if result['Records']:
            record = result['Records'][0]
            return {
                'statusCode': 200,
                'body': json.dumps({
                    'vin': vin,
                    'offer_value': float(record[0]['doubleValue']),
                    'confidence': float(record[1]['doubleValue']),
                    'valid_days': int(record[2]['longValue']),
                    'confidence_band': float(record[3]['doubleValue']),
                    'timestamp': datetime.utcnow().isoformat()
                })
            }
        else:
            return {
                'statusCode': 404,
                'body': json.dumps({'error': 'No valuation found for VIN'})
            }
            
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
