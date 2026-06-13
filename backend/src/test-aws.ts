import dotenv from "dotenv";
dotenv.config();

import { S3Client, HeadBucketCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { STSClient, GetCallerIdentityCommand } from "@aws-sdk/client-sts";

const AWS_REGION = process.env.AWS_REGION ?? "ap-south-1";
const S3_REGION = process.env.S3_REGION ?? AWS_REGION;
const BEDROCK_REGION = process.env.BEDROCK_REGION ?? "us-east-1";
const S3_BUCKET = process.env.S3_BUCKET ?? "";
const BEDROCK_MODEL_ID = process.env.BEDROCK_MODEL_ID ?? "amazon.nova-lite-v1:0";

async function testSTS() {
  console.log("\n--- 1. AWS Credentials (STS) ---");
  try {
    const sts = new STSClient({ region: AWS_REGION });
    const identity = await sts.send(new GetCallerIdentityCommand({}));
    console.log("✅ AWS credentials valid");
    console.log(`   Account: ${identity.Account}`);
    console.log(`   ARN: ${identity.Arn}`);
  } catch (e: any) {
    console.log("❌ AWS credentials FAILED:", e.message);
  }
}

async function testS3() {
  console.log("\n--- 2. S3 Bucket ---");
  if (!S3_BUCKET) {
    console.log("⚠️  S3_BUCKET not set, skipping");
    return;
  }
  try {
    const s3 = new S3Client({ region: S3_REGION });
    await s3.send(new HeadBucketCommand({ Bucket: S3_BUCKET }));
    console.log(`✅ S3 bucket "${S3_BUCKET}" exists and accessible (region: ${S3_REGION})`);
  } catch (e: any) {
    if (e.name === "NotFound" || e.$metadata?.httpStatusCode === 404) {
      console.log(`❌ S3 bucket "${S3_BUCKET}" does NOT exist in region ${S3_REGION}`);
    } else if (e.$metadata?.httpStatusCode === 403) {
      console.log(`❌ S3 bucket "${S3_BUCKET}" exists but ACCESS DENIED (check IAM permissions)`);
    } else {
      console.log(`❌ S3 error: ${e.name} - ${e.message}`);
    }
  }
}

async function testBedrock() {
  console.log("\n--- 3. Bedrock (AI Grading) ---");
  
  // Try multiple model ID formats
  const modelIds = [
    BEDROCK_MODEL_ID,
    "amazon.nova-lite-v1:0",
    "us.amazon.nova-lite-v1:0",
  ];

  for (const modelId of modelIds) {
    try {
      console.log(`   Trying model: ${modelId}`);
      const bedrock = new BedrockRuntimeClient({ region: BEDROCK_REGION });
      const body = {
        messages: [{ role: "user", content: [{ text: "Say hi" }] }],
        inferenceConfig: { maxTokens: 10 },
      };
      const cmd = new InvokeModelCommand({
        modelId,
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify(body),
      });
      const resp = await bedrock.send(cmd);
      const result = JSON.parse(new TextDecoder().decode(resp.body));
      console.log(`✅ Bedrock model "${modelId}" responded (region: ${BEDROCK_REGION})`);
      console.log(`   Response:`, JSON.stringify(result).slice(0, 150));
      return; // success, stop trying
    } catch (e: any) {
      console.log(`   ❌ ${modelId}: ${e.name} - ${e.message?.slice(0, 100)}`);
    }
  }
  console.log(`\n   → Fix: Add bedrock:InvokeModel permission to IAM user "reloop-dev"`);
}

async function main() {
  console.log("=== AWS Service Connectivity Test ===");
  console.log(`AWS_REGION: ${AWS_REGION}`);
  console.log(`S3_REGION: ${S3_REGION}`);
  console.log(`BEDROCK_REGION: ${BEDROCK_REGION}`);
  console.log(`S3_BUCKET: ${S3_BUCKET}`);
  console.log(`BEDROCK_MODEL_ID: ${BEDROCK_MODEL_ID}`);

  await testSTS();
  await testS3();
  await testBedrock();

  console.log("\n=== Done ===\n");
}

main();
