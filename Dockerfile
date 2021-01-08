FROM public.ecr.aws/lambda/nodejs:12

# Create function directory
ARG FUNCTION_DIR="/var/task"
RUN mkdir -p ${FUNCTION_DIR}

# Copy our benchmark file
COPY resources/input.txt ${FUNCTION_DIR}/resources/input.txt

# Copy handler and package.json
COPY package.json package-lock.json ${FUNCTION_DIR}/
COPY src/ ${FUNCTION_DIR}/src/

# Install dependencies
RUN npm install --production

# Set the CMD to our handler
CMD [ "src/handler.benchmark" ]
