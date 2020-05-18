# The tag here should match the Meteor version of your app, per .meteor/release
FROM sozialhelden/meteor-base:1.4.4.2

# Copy app package.json and package-lock.json into container
COPY ./app/package*.json $APP_SOURCE_FOLDER/

RUN bash $SCRIPTS_FOLDER/build-app-npm-dependencies.sh

# Copy app source into container
COPY ./app $APP_SOURCE_FOLDER/
ENV TOOL_NODE_FLAGS "--max-old-space-size=4096 --optimize_for_size --gc-interval=100"
RUN bash $SCRIPTS_FOLDER/build-meteor-bundle.sh


# Use the specific version of Node expected by your Meteor release, per https://docs.meteor.com/changelog.html; this is expected for Meteor 1.10.2
FROM node:4.8.1

ENV APP_BUNDLE_FOLDER /opt/bundle
ENV SCRIPTS_FOLDER /docker

RUN apt-get -yqq update \
    && DEBIAN_FRONTEND=noninteractive apt-get -yqq install \
        curl \
        g++ \
        make \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy in entrypoint
COPY --from=0 $SCRIPTS_FOLDER $SCRIPTS_FOLDER/

# Copy in app bundle
COPY --from=0 $APP_BUNDLE_FOLDER/bundle $APP_BUNDLE_FOLDER/bundle/

RUN bash $SCRIPTS_FOLDER/build-meteor-npm-dependencies.sh --build-from-source


# Start another Docker stage, so that the final image doesn’t contain the layer with the build dependencies
# See previous FROM line; this must match
FROM node:4.8.1

ENV APP_BUNDLE_FOLDER /opt/bundle
ENV SCRIPTS_FOLDER /docker

# Install OS runtime dependencies
RUN apt-get -yqq update \
    && DEBIAN_FRONTEND=noninteractive apt-get -yqq install \
        curl \
		bash \
		ca-certificates \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy in entrypoint with the built and installed dependencies from the previous image
COPY --from=1 $SCRIPTS_FOLDER $SCRIPTS_FOLDER/

# Copy in app bundle with the built and installed dependencies from the previous image
COPY --from=1 $APP_BUNDLE_FOLDER/bundle $APP_BUNDLE_FOLDER/bundle/

# Start app
ENTRYPOINT ["/docker/entrypoint.sh"]

CMD ["node", "main.js"]