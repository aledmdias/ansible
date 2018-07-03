use {{ mongodb_configuration.credential.db }};

db.createUser({
  user: "{{ mongodb_configuration.credential.user }}",
  pwd: "{{ mongodb_configuration.credential.pwd }}",
  roles: [
    { role: "{{ mongodb_configuration.credential.role }}", db: "{{ mongodb_configuration.credential.db }}" }
  ]
});
