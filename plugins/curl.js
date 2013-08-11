
function curl() {
    


    // val is "get", params is url
    this.cmd = function(id, val, params) {

    }

    this.driver = {
        name: 'curl',
        cmds:['get'],
    }   
}

module.exports = new curl();

