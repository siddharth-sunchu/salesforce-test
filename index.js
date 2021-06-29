const splitTextIntoArr = require('./utils/splitText');
const dependCommand = require('./commands/dependCommand');

const functionData = (input) => {

    const dependencies = new Map();
    const installPackages = new Map();

    const listOfChild = new Set();

    let result = '';

    const commands = splitTextIntoArr(input);

    // console.log(commands, 'commands');

    for(let i = 1; i < commands.length; i++) {
        const currentCommands = commands[i];
        const currentOperation = currentCommands[0];

        if(currentOperation === 'DEPEND') {
            dependCommand(dependencies, currentCommands);
        }

        
    }

    // for(let i = 1; i < commands.length; i++) {
    //     // console.log('TEST', commands[i].split(" "))

    //     // const eachCommands = commands[i].split("/\s+/");
    //     const eachCommands = commands[i].split(" ");
    //     if(eachCommands[0] == 'END') {
    //         result = result + eachCommands.join(' ');
    //         break;
    //     } else {
    //         result = result + eachCommands.join(' ') + '\n';
            
    //         if(eachCommands[0] == 'DEPEND') {
                
    //             dependCommand(eachCommands.splice(1));
    //         }

    //         if(eachCommands[0] == 'INSTALL') {
    //             installCommand(eachCommands.splice(1));
    //         }

    //         if(eachCommands[0] == 'REMOVE') {
    //             removeCommand(eachCommands.splice(1));
    //         }

    //         if(eachCommands[0] == 'LIST') {
    //             listCommand(eachCommands.splice(1));
    //         }
    //     }
    // }

    console.log(result);



};

let input = "22\n" +
"DEPEND TELNET TCPIP NETCARD\n" +
"DEPEND TCPIP NETCARD\n" +
"DEPEND NETCARD TCPIP\n" +
"DEPEND DNS TCPIP NETCARD\n" +
"DEPEND BROWSER TCPIP HTML\n" +
"INSTALL NETCARD\n" +
"INSTALL TELNET\n" +
"INSTALL foo\n" +
"REMOVE NETCARD\n" +
"INSTALL BROWSER\n" +
"INSTALL DNS\n" +
"LIST\n" +
"REMOVE TELNET\n" +
"REMOVE NETCARD\n" +
"REMOVE DNS\n" +
"REMOVE NETCARD\n" +
"INSTALL NETCARD\n" +
"REMOVE TCPIP\n" +
"REMOVE BROWSER\n" +
"REMOVE TCPIP\n" +
"LIST\n" +
"END"
functionData(input);

