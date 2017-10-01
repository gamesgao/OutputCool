# OutputCool
This is a desktop executable module to output anything in a NB way.

## Dependency
- Webpack
  - To build the web page file 
- Vue, Vue-router, Vue-resource
  - Make the web page modulize
  - Vue-resource actually is not used. But may be used in the future
- Socket.io
  - The interface of output
- Bootstrap
  - Reserved for furthur development
- Electron
  - The UI Framework

## Get Started

1. Clone this repo.
2. `npm install` to install all the dependencies.
3. `npm run build` to build the web page file.
4. `electron .` to run the program. (Maybe you need to install Electron in global first)

## How to output

1. Use **socket.io-client** to connect to local server. Like `io.connect('http://localhost:6000')`.
2. Emit the data event with args you want to output.
3. The output will show in a **NB** way

## Further Work

- Add other interface such as **Socket** or **WebUI**
- Add more options on the way to show the output.
- Functions like **hide** or **clear**
- Release executable file.
