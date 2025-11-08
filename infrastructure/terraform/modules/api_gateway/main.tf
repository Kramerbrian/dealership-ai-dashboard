# API Gateway REST API
resource "aws_apigatewayv2_api" "main" {
  name          = "${var.cluster_name_prefix}-api"
  protocol_type = "HTTP"
  description   = "Auction Intelligence Mesh API"
  
  cors_configuration {
    allow_origins = ["*"]
    allow_methods = ["GET", "POST", "OPTIONS"]
    allow_headers = ["content-type", "authorization"]
    max_age       = 300
  }
  
  tags = var.tags
}

# API Gateway Integration for /appraise endpoint
resource "aws_apigatewayv2_integration" "appraise" {
  api_id = aws_apigatewayv2_api.main.id
  
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
  integration_uri    = aws_lambda_function.appraise.invoke_arn
}

resource "aws_apigatewayv2_route" "appraise" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "POST /api/v1/appraise"
  target    = "integrations/${aws_apigatewayv2_integration.appraise.id}"
}

# API Gateway Integration for /vin/history endpoint
resource "aws_apigatewayv2_integration" "vin_history" {
  api_id = aws_apigatewayv2_api.main.id
  
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
  integration_uri    = aws_lambda_function.vin_history.invoke_arn
}

resource "aws_apigatewayv2_route" "vin_history" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "GET /api/v1/vin/history"
  target    = "integrations/${aws_apigatewayv2_integration.vin_history.id}"
}

# API Gateway Integration for /vin/value endpoint
resource "aws_apigatewayv2_integration" "vin_value" {
  api_id = aws_apigatewayv2_api.main.id
  
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
  integration_uri    = aws_lambda_function.vin_value.invoke_arn
}

resource "aws_apigatewayv2_route" "vin_value" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "GET /api/v1/vin/value"
  target    = "integrations/${aws_apigatewayv2_integration.vin_value.id}"
}

# API Gateway Integration for /health endpoint
resource "aws_apigatewayv2_integration" "health" {
  api_id = aws_apigatewayv2_api.main.id
  
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
  integration_uri    = aws_lambda_function.health.invoke_arn
}

resource "aws_apigatewayv2_route" "health" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "GET /api/v1/health"
  target    = "integrations/${aws_apigatewayv2_integration.health.id}"
}

# API Gateway Stage
resource "aws_apigatewayv2_stage" "main" {
  api_id      = aws_apigatewayv2_api.main.id
  name        = var.environment
  auto_deploy = true
  
  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_gateway.arn
    format = jsonencode({
      requestId      = "$context.requestId"
      ip             = "$context.identity.sourceIp"
      requestTime   = "$context.requestTime"
      httpMethod     = "$context.httpMethod"
      routeKey       = "$context.routeKey"
      status         = "$context.status"
      protocol       = "$context.protocol"
      responseLength = "$context.responseLength"
    })
  }
  
  tags = var.tags
}

# CloudWatch Log Group for API Gateway
resource "aws_cloudwatch_log_group" "api_gateway" {
  name              = "/aws/apigateway/${var.cluster_name_prefix}"
  retention_in_days = 30
  
  tags = var.tags
}

# Lambda Permission for API Gateway
resource "aws_lambda_permission" "appraise" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.appraise.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}

resource "aws_lambda_permission" "vin_history" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.vin_history.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}

resource "aws_lambda_permission" "vin_value" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.vin_value.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}

resource "aws_lambda_permission" "health" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.health.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}
