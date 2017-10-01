const BrowserWindow = require('electron').remote.BrowserWindow
const path = require('path')
const current = require('electron').remote.getCurrentWindow()

var VM = new Vue({
  el: 'form',
  data: {
    username: '',
    password: '',
    status: '',
    message: ''
  },
  computed: {
    iserror: function () {
      if (this.username !== '' && this.password !== '') {
        return false
      }
      return true
    }
  },
  methods: {
    register: function () {
      location.href = '/register'
    },
    login: function () {
      const modalPath = path.join('file://', __dirname, './game.html')
            // let win = new BrowserWindow({ width: 400, height: 320 })
            // win.on('close', function() { win = null })
      current.loadURL(modalPath)
            // win.show()
            // var data = {
            //     "username": this.username,
            //     "password": this.password
            // };
            // this.$http.post('/login', data).then(
            //     function(response) {
            //         if (response.data.status == 1) {
            //             VM.status = "Success!";
            //             VM.message = response.data.msg;
            //             setTimeout(function() {
            //                 location.href = `/homepage?userID=${response.data.msg}`;
            //             }, 2000);
            //             $('#warning').modal({});
            //         } else if (response.data.status == 0) {
            //             VM.status = "Error!";
            //             VM.message = `Something wrong while logging ERR:${response.data.msg}`;
            //             $('#warning').modal({});
            //         }
            //     },
            //     function(err) {
            //         console.log(err);
            //     }
            // )
    }
  }
})
