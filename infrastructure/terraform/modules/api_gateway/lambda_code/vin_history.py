import json
import boto3
import os
from datetime import datetime

def handler(event, context):
    """Generate comprehensive VIN History Report via Bedrock agent"""
    
    try:
        query_params = event.get('queryStringParameters', {})
        vin = query_params.get('vin')
        
        if not vin:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'VIN query parameter is required'})
            }
        
        # Invoke Bedrock agent
        bedrock_agent_runtime = boto3.client('bedrock-agent-runtime')
        
        # Prepare prompt
        prompt = f"""
        Generate a comprehensive VIN History Report for VIN: {vin}
        
        Include:
        1. Vehicle identification and specifications
        2. Auction history across platforms (Manheim, ACV, ADESA)
        3. Valuation trends and confidence intervals
        4. Risk assessment and suspicious activity flags
        5. Natural language explanations of valuation factors
        
        Use data from the knowledge base and provide citations.
        """
        
        response = bedrock_agent_runtime.invoke_agent(
            agentId=os.environ['BEDROCK_AGENT_ID'],
            agentAliasId='TSTALIASID',  # Use default alias
            sessionId=f"session-{context.request_id}",
            inputText=prompt
        )
        
        # Stream response
        report_text = ""
        for event in response['completion']:
            if 'chunk' in event:
                report_text += event['chunk']['bytes'].decode('utf-8')
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'vin': vin,
                'report': report_text,
                'generated_at': datetime.utcnow().isoformat()
            })
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
