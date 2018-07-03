use {{  mongodb_configuration.credential.db }};

var groups = {
  "mongodbreplica": [],
  "mongodbarbiter": []
};

{% if groups["mongodbreplica"] | default(None) %}
{% for mongodb_instance in groups["mongodbreplica"] %}
groups["mongodbreplica"].push("{{ mongodb_instance }}");
{% endfor %}
{% endif %}

{% if groups["mongodbarbiter"] | default(None) %}
{% for mongodb_instance in groups["mongodbarbiter"] | default([]) %}
groups["mongodbarbiter"].push("{{ mongodb_instance }}");
{% endfor %}
{% endif %}

var inventory_hostname = "{{ inventory_hostname }}";
var _primary = "{{ _primary }}";

var primary = [];
var secondary = [];
var arbiter = [];

var isPrimary = function() {
  return inventory_hostname == _primary;
};

var memberHost = function(member) {
  return member + ":27017";
};

var alreadyInitiated = function() {
  return ( rs.status().ok != 0 ? true : false );
};

var members = function() {
  if (alreadyInitiated()) {
    return rs.config().members;
  } else {
    return [];
  }
};

var alreadyMember = function(member) {
  var isMember = false;

  for (var index = 0; index < members().length; index++) {
    if (members()[index].host == member) {
      isMember = true;
      break;
    }
  }

  return isMember;
};

var totalReplica = (groups["mongodbreplica"] || []).length;
var totalArbiter = (groups["mongodbarbiter"] || []).length;

var counterReplica = totalReplica - 1;
var counterArbiter = totalArbiter - 1;

var initiate = function() {
  rs.initiate({
    _id: "{{ mongodb_configuration.replication.replSetName }}",
    members: [
      { _id: 1, host: memberHost(_primary), arbiterOnly: false, priority: 1 }
    ]
  });
};

var appendSecondaryMembers = function() {
  for (var index = 0; index < (groups["mongodbreplica"] || []).length; index++) {
    var member = groups["mongodbreplica"][index];

    if (!alreadyMember(memberHost(member))) {
      counterReplica++;
      rs.add({ _id: counterReplica, host: memberHost(member), arbiterOnly: false, priority: counterReplica });
    }
  }
};

var appendArbiterMembers = function() {
  for (var index = 0; index < (groups["mongodbarbiter"] || []).length; index++) {
    var member = groups["mongodbarbiter"][index];

    if (!alreadyMember(memberHost(member))) {
      counterReplica++;
      rs.addArb(memberHost(member));
    }
  }
};

if (alreadyInitiated()) {
  if (isPrimary()) {
    appendSecondaryMembers();
    appendArbiterMembers();
  }
} else {
  if (isPrimary()) {
    initiate();
    appendSecondaryMembers();
    appendArbiterMembers();
  }
}
