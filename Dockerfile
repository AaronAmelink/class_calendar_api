FROM node:bookworm-slim

RUN useradd -ms /bin/bash classnotes

USER root

WORKDIR /home/classnotes
COPY package*.json /home/classnotes/


ARG PORT_NUMBER
ARG DATABASE_URI
ARG DATABASE_NAME
ARG CERT

ENV PORT ${PORT_NUMBER}
ENV DATABASE_NAME ${DATABASE_NAME}
ENV DATABASE_URI ${DATABASE_URI}
ENV CERT ${CERT}

RUN chown -Rh classnotes:classnotes /home/classnotes/

RUN npm install


USER classnotes

EXPOSE ${PORT_NUMBER}

COPY ./index.js /home/classnotes/
COPY ./processors /home/classnotes/processors
COPY ./routes /home/classnotes/routes
COPY ./utils /home/classnotes/utils
CMD ["/bin/bash", "-c", "npm start" ]

ENTRYPOINT [ "/bin/bash", "-c", "npm start" ]