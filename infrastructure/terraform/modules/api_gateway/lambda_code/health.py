import json
import boto3
import os

def handler(event, context):
    """Health check endpoint for orchestrator status"""
    
    try:
        health_status = {
            'status': 'healthy',
            'timestamp': context.aws_request_id,
            'components': {}
        }
        
        # Check EKS cluster
        try:
            eks = boto3.client('eks')
            cluster_name = os.environ.get('EKS_CLUSTER_NAME')
            if cluster_name:
                cluster = eks.describe_cluster(name=cluster_name)
                health_status['components']['eks'] = {
                    'status': cluster['cluster']['status'],
                    'version': cluster['cluster']['version']
                }
        except Exception as e:
            health_status['components']['eks'] = {'status': 'error', 'error': str(e)}
        
        # Check MSK cluster
        try:
            kafka = boto3.client('kafka')
            msk_arn = os.environ.get('MSK_CLUSTER_ARN')
            if msk_arn:
                cluster = kafka.describe_cluster(ClusterArn=msk_arn)
                health_status['components']['msk'] = {
                    'status': cluster['ClusterInfo']['State']
                }
        except Exception as e:
            health_status['components']['msk'] = {'status': 'error', 'error': str(e)}
        
        # Check Redshift
        try:
            redshift = boto3.client('redshift')
            cluster_id = os.environ.get('REDSHIFT_CLUSTER_ID')
            if cluster_id:
                cluster = redshift.describe_clusters(ClusterIdentifier=cluster_id)
                if cluster['Clusters']:
                    health_status['components']['redshift'] = {
                        'status': cluster['Clusters'][0]['ClusterStatus']
                    }
        except Exception as e:
            health_status['components']['redshift'] = {'status': 'error', 'error': str(e)}
        
        # Determine overall status
        all_healthy = all(
            comp.get('status') in ['ACTIVE', 'AVAILABLE', 'healthy'] 
            for comp in health_status['components'].values()
        )
        
        if not all_healthy:
            health_status['status'] = 'degraded'
        
        return {
            'statusCode': 200,
            'body': json.dumps(health_status)
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'status': 'unhealthy', 'error': str(e)})
        }
