const objects = import.meta.glob('./object_files/*.js');
var envObjects = [];
Object.keys(objects).forEach((key) => { var promise = objects[key](); promise.then((data) => { envObjects.push(data.default) }) });
export default envObjects;