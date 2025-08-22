const objects = import.meta.glob('./object_files/*.js');
var envObjects = [
    {
        id: 'star',
        x: 1,
        y: 100, height: 'bottom'
    },
    {
        id: 'bomb',
        x: 200,
        y: 100, height: 'middle'
    },
    {
        id: 'star', height: 'bottom'
    },
    { id: 'bench', height: 'bottom', name: 'Sumagna Das' },
    { id: 'bench', height: 'top', name: 'Sumagna Das' },
];
Object.keys(objects).forEach((key) => { var promise = objects[key](); promise.then((data) => { envObjects.push(data.default) }) });
export default envObjects;