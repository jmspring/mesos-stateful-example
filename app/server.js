// simple api server
//  this script is a simple postgres api server.  it supports
//  basic create / delete / update of values in a postgres database.
//  while the script is generic, it is specifically setup to work 
//  with a postgres container w/ persistent storage on Mesos.
var postgres = require('pg'),
    express = require('express'),
    bodyParser = require('body-parser');
    
var app = express(),
    router = express.Router();
    
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;
var dbuser = process.env.DBUSER || null;
var dbpassword = process.env.DBPASSWORD || null;
var dbhost = process.env.DBHOST || "localhost";
var dbport = process.env.DBPORT || 5432;
var db = process.env.DBNAME || null;
var connectionString = "postgres://" + dbuser + ":" + dbpassword + "@" +
                       dbhost + ":" + dbport + "/" + db;

router.use(function(req, res, next) {
  console.log('%s %s %s', Date.now(), req.method, req.path);
  next();  
});

router.get('/kv/:id', function(req, res) {
    var id = req.params.id; 
    var client = new postgres.Client(connectionString);
    client.connect(function(err) {
        if(err) {
            return console.error('query: Unable to connect to server.');
        } else {
            client.query('SELECT * FROM kv WHERE pkey=\'' + id + '\'', function(err, result) {
                if(err) {
                    res.json({'select': 'failed'});
                } else {
                    if(result.rowCount > 0) {
                        res.json(result.rows[0]);
                    } else {
                        res.json({'select': 'entry not found'});
                    }
                }
                client.end();
            });
        }
    });
});

router.get('/kv', function(req, res) {
    var data = [];
    var client = new postgres.Client(connectionString);
    client.connect(function(err) {
        if(err) {
            return console.error('query all: Unable to connect to server.');
        } else {
            client.query('SELECT * FROM kv', function(err, result) {
                if(err) {
                    res.json({'select all': 'failed'});
                } else {
                    for(i = 0; i < result.rowCount; i++) {
                        data.push(result.rows[i]);
                    }
                    if(data.length > 0) {
                        res.json(data);
                    } else {
                        res.json({ "select all": "no entries" });
                    }
                }
                client.end();
            });
        }
    });
});

router.post('/kv/:id/:val', function(req, res) {
    var id = req.params.id;
    var val = req.params.val;
    var client = new postgres.Client(connectionString);
    client.connect(function(err) {
        if(err) {
            return console.error('post id: Unable to connect to server.');
        } else {
            client.query('SELECT * FROM kv WHERE pkey=\'' + id + '\'', function(err, result) {
                if(err) {
                    res.json({'select for update': 'failed'});
                } else {
                    if(result.rowCount > 0) {
                        client.query('UPDATE kv SET pval = \'' + val + '\' WHERE pkey=\'' + id + '\'', function(err, result) {
                            if(err) {
                                res.json({'update': 'failed'});
                            } else {
                                res.json({'update': 'succeeded'});
                            }
                        });
                    } else {
                        client.query('INSERT INTO kv VALUES (\'' + id + '\', \'' + val + '\')', function(err, result) {
                            if(err) {
                                res.json({'insert': 'failed'});
                            } else {
                                res.json({'insert': 'succeeded'});
                            }
                        })
                    }
                }
                client.end();
            });
        }
    });
});

router.delete('/kv/:id', function(req, res) {
    var id = req.params.id;
    var result = [];
    var client = new postgres.Client(connectionString);
    client.connect(function(err) {
        if(err) {
            return console.error('delete id: Unable to connect to server.');
        } else {
            client.query('DELETE FROM kv WHERE pkey=\'' + id + '\'', function(err, result) {
                if(err) {
                    res.json({'delete': 'failed'});
                } else {
                    res.json({'delete': 'succeeded'});
                }
                client.end();
            });
        }
    });
});

app.use('/api', router);

if((dbuser == null) || (dbpassword == null) || (db == null)) {
    console.log('Database name, user, or password not set.');
} else {
    // check if the table already exists, if not create it.
    var client = new postgres.Client(connectionString)
    client.connect(function(err) {
        if(err) {
            return console.error('Unable to connect to database ' + db + '.', err)
        } else {
            client.query('CREATE TABLE IF NOT EXISTS kv (' +
                         '    pkey      varchar(255) PRIMARY KEY, ' +
                         '    pval      varchar(1024) NOT NULL)',
                function(err, result) {
                    if(err) {
                        return console.error('Unable to create table "kv".' + err);
                    } else {
                        app.listen(port);
                        console.log("Listening on port " + port);
                    }
                    client.end();
                }      
            );
        }
    });   
}