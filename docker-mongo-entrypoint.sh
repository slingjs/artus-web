#!/bin/sh

set -e
set -u
# set -x	# Uncomment for debugging


# The replica set configuration document
#
#mongo-0: Primary, since we initiate the replica set on mongo-0
#mongo-1: Secondary
#mongo-2: Arbiter, since we set the 'arbiterOnly' option to true
_config=\
'
{
	"_id": "rs0",
	"members": [
		{ "_id": 0, "host": "mongo-0" },
		{ "_id": 1, "host": "mongo-1" },
		{ "_id": 2, "host": "mongo-2", arbiterOnly: true },
	]
}
'

sleep 5;
mongosh --quiet \
--host mongo-0 \
<<-EOF
  rs.initiate($_config);
EOF

exec "$@"
