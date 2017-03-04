development:
	supervisor node ./bin/www

run:
	@node ./bin/www

mongodb:
	/users/wuseijian/mongodb/bin/mongod --dbpath /users/wuseijian/mongodb/data/db

r:
	node ./public/r.js -o ./public/build.js

start:
	pm2 start ./bin/www --name "xiaoduyu" --max-memory-restart 400M

restart:
	pm2 restart "xiaoduyu"

.PHONY: development run mongodb r start restart
