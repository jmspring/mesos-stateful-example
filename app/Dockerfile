# Dockerfile for simple node CRUD front end for Postgres DB

FROM ubuntu:14.04

RUN apt-get update \
    && apt-get -y install nodejs nodejs-legacy npm postgresql-client
    
COPY package.json /src/package.json
RUN cd /src; npm install 

COPY server.js /src
COPY run_server.sh /src

EXPOSE 8080

CMD [ "/src/run_server.sh" ]