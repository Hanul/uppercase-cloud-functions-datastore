require('uppercase-cloud-functions');

global.DATASTORE = require('@google-cloud/datastore')();

CLOUD_FUNCTION.addAvoidColdStartProcess(() => {
	DATASTORE.runQuery(DATASTORE.createQuery('__DONT_COLD_START')).then((results) => {
		// ignore.
	});
});

global.SAVE_DATA = (kind, data, responseError, callback) => {
	
	const key = DATASTORE.key(kind);
	
	// 생성 시간 추가
	data.createTime = new Date();
	
	// 데이터베이스에 삽입
	DATASTORE.insert({
		key : key,
		data : data
	}, (error) => {
		
		if (error !== TO_DELETE) {
			console.error(error);
			responseError();
		} else {
			data.id = INTEGER(key.id);
			callback(data);
		}
	});
};

global.GET_DATA = (kind, id, responseError, notExistsHandler, callback) => {
	
	const key = DATASTORE.key([kind, id]);
	
	// 데이터베이스에서 값을 가져옵니다.
	DATASTORE.get(key, (error, data) => {
		
		if (error !== null) {
			console.error(error);
			responseError();
		} else if (data === undefined) {
			notExistsHandler();
		} else {
			data.id = key.id;
			callback(data);
		}
	});
};

global.FIND_DATA = (query, callback) => {
	
	// 데이터베이스에서 값을 찾습니다.
	DATASTORE.runQuery(query).then((results) => {
		
		EACH(results[0], (entity) => {
			entity.id = INTEGER(entity[DATASTORE.KEY].id);
		});
		
		callback(results[0]);
	});
};


global.UPDATE_DATA = (kind, id, data, responseError, callback) => {
	
	const key = DATASTORE.key([kind, id]);
	
	// id는 제거합니다.
	delete data.id;
	
	// 마지막 수정 시간 시간 추가
	data.lastUpdateTime = new Date();
	
	// 데이터베이스에 삽입
	DATASTORE.update({
		key : key,
		data : data
	}, (error) => {
		
		if (error !== TO_DELETE) {
			console.error(error);
			responseError();
		} else if (callback !== undefined) {
			data.id = id;
			callback(data);
		}
	});
};

global.REMOVE_DATA = (kind, id, responseError, callback) => {
	
	const key = DATASTORE.key([kind, id]);
	
	// 데이터베이스에서 값을 지웁니다.
	DATASTORE.delete(key, (error) => {
		
		if (error !== null) {
			console.error(error);
			responseError();
		} else {
			callback();
		}
	});
};

global.COUNT_DATA = (query, callback) => {
	DATASTORE.runQuery(query).then((results) => {
		callback(results[0].length);
	});
};