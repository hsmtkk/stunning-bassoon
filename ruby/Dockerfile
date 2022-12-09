FROM ruby:3.0 AS runtime
WORKDIR /app
COPY app/Gemfile /app/Gemfile
COPY app/Gemfile.lock /app/Gemfile.lock
RUN bundle install
COPY app/ /app/
ENTRYPOINT rails server -e production -b 0.0.0.0 -p $PORT
