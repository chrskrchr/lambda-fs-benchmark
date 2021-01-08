### Running the Lambda Benchmark
This project provides a benchmark of container-based Lambda FS read performance when reading from an EFS mount as well as the local container file system.
It uses a 1GB file as input and performs both a full scan as well as random reads from the input file. 
The URLs below 

* **EFS**
   * **Full Scan:**  `POST https://b7c2z48orl.execute-api.us-east-1.amazonaws.com/dev/benchmark/efs/scan`
   * **Random Reads:** `POST https://b7c2z48orl.execute-api.us-east-1.amazonaws.com/dev/benchmark/efs/random`
* **Local**
   * **Full Scan:**  `POST https://b7c2z48orl.execute-api.us-east-1.amazonaws.com/dev/benchmark/local/scan`
   * **Random Reads:** `POST https://b7c2z48orl.execute-api.us-east-1.amazonaws.com/dev/benchmark/local/random`

NOTE: you may hit the 30s API Gateway timeout when hitting the URLs above, in which case you'll need to look at the CloudWatch logs to see the benchmark.

If they don't time out, the responses from the URLs above include various benchmark statistics about the read latency. 

TODO: provide a sample benchmark

### Deploying the Lambda
1. Generate the input file
    - `npm run generate-input-file`
1. Build and tag the Docker image
    - `docker build . -t lambda-fs-benchmark:<versionNum>`
1. Push the docker image
    - `docker tag lambda-fs-benchmark:<versionNum> 393839994693.dkr.ecr.us-east-1.amazonaws.com/lambda-fs-benchmark:<versionNum>`
    - `docker push 393839994693.dkr.ecr.us-east-1.amazonaws.com/lambda-fs-benchmark:<versionNum>`
1. Update the `functions.benchmark.image` version number in `serverless.yml`
1. Deploy the function
    - `serverless deploy`
    
### Updating the S3 Input File
1. Upload the file
    - `aws s3 cp resources/input.txt s3://ip-tools-dev/efs/input.txt`
1. Run the DataSync task to sync the file to EFS
    - `https://console.aws.amazon.com/datasync/home?region=us-east-1#/tasks/task-0765168663e5e3af8`