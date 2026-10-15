process.env.DATABASE_URL ||=
  "postgres://postgres:postgres@127.0.0.1:5432/kope_test";
process.env.SESSION_SECRET ||= "test-session-secret-32-chars-min!!";
