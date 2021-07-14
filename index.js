const splitTextIntoArr = require('./utils/splitText');
// const dependCommand = require('./commands/dependCommand');
// const dependentGraph = new Map();
const dependenciesGraph = new Map();
const installPackages = new Set();

const checkCyclic = (currentPackage, dependentPackage) => {
    if(dependenciesGraph.has(dependentPackage)) {
        const dependentGraphObj = dependenciesGraph.get(dependentPackage);
        if(dependentGraphObj.dependencies.has(currentPackage)) {
            return true;
        }
        return false;
    }


    return false;
}

const removeCyclicPackages = (currentPackage, dependentPackages) => {

    const nonCyclicPackages = new Set();
    const cyclicPackages = new Set();
    dependentPackages.forEach((packageName) => {
        if(!checkCyclic(currentPackage, packageName)) {
            nonCyclicPackages.add(packageName);
        } else {
            cyclicPackages.add(packageName);
        }
    });

    return { cyclic: cyclicPackages, nonCyclic: nonCyclicPackages };

}

const dependCommand = (commands) => {

    let result = '';
    
    const dependentUpon = commands[1];
    const dependentList = commands.slice(2, commands.length);

    // console.log(`${commands[0]} ${dependentUpon} ${dependentList.join(' ')}`);

    const filterCyclic = removeCyclicPackages(dependentUpon, dependentList);
    const { cyclic, nonCyclic } = filterCyclic;

    if(dependenciesGraph.has(dependentUpon)) {
        const graphObj = dependenciesGraph.get(dependentUpon);
        graphObj.dependencies = new Set([...nonCyclic, ...graphObj.dependencies]);
        dependenciesGraph.set(dependentUpon, graphObj);
    } else {
        const innerObj = {
            dependencies: new Set([...nonCyclic]),
            parent: true,
            dependentUpon: new Set()
        }
        dependenciesGraph.set(dependentUpon, innerObj);
    };

    cyclic.forEach((packageName) => {
        result += `${packageName} depends upon on ${dependentUpon}, ignoring command`;
        result += '\n';
        // console.log(`${packageName} depends upon on ${dependentUpon}, ignoring command`);
    });

    nonCyclic.forEach((packageName) => {
        if(dependenciesGraph.has(packageName)) {
            const graphObj = dependenciesGraph.get(packageName);
            graphObj.dependentUpon = new Set([dependentUpon, ...graphObj.dependentUpon]);
            dependenciesGraph.set(packageName, graphObj);
        } else {
            const innerObj = {
                dependencies: new Set(),
                parent: false,
                dependentUpon: new Set([dependentUpon])
            }
            dependenciesGraph.set(packageName, innerObj);
        }
    });

    return result;
};





const installCommand = (commands) => {
    const installPackage = commands[1];
    // console.log(`${commands[0]} ${installPackage}`);
    const installNodes = new Set();
    let result = '';

    const installPackagesDFS = (installPackage, check) => {

        

        if(!installNodes.has(installPackage)) {
            installNodes.add(installPackage);
            if(installPackages.has(installPackage)) {
                if(!check) {
                    // console.log(`   ${installPackage} is already installed`);
                    result += `${installPackage} is already installed`;
                    result += '\n';
                }
                
            } else {
        
                if(dependenciesGraph.has(installPackage)) {
                    const packageInfo = dependenciesGraph.get(installPackage);
                        packageInfo.dependencies.forEach((package) => {
                            // if(!installNodes.has(package)) {
                                // installNodes.add(package);
                                installPackagesDFS(package, true);
                            // }
    
                    });
                } 
        
                installPackages.add(installPackage);
                // console.log(`   ${installPackage} successfully installed`);
                // result += `${installPackage} successfully installed`;
                result += `Installing ${installPackage}`;
                result += '\n';
        
            }
        }


    };

    installPackagesDFS(installPackage);

    return result;
}

const ListCommand = () => {

    let result = '';
    // console.log('LIST');
    installPackages.forEach((installPackage) => {
        result += `${installPackage}`;
        result += '\n';
        // console.log(`   ${installPackage}`);
    });

    return result;
};

const removeCommand = (packageName) => {

    let result = '';

    // console.log(`REMOVE ${packageName}`);
    const visitedNodes = new Set();

    const dfsRemove = (package, check) => {

        if(!visitedNodes.has(package)) {
            visitedNodes.add(package);
            if(installPackages.has(package)) {
                const graphObj = dependenciesGraph.get(package);
    
                if(graphObj.dependentUpon.size > 0) {
                    if(!check) {
                        // console.log(`   ${package} is still needed`);
                        result += `${package} is still needed`;
                        result += '\n';
                    }
                } else {
    
                    removeDependentObj(package);
                    dependenciesGraph.delete(package);
                    installPackages.delete(package);
                    if(check) {
                        // console.log(`   ${package} is no longer needed`);
                        // result += `${package} is no longer needed`;
                        // result += '\n';
                    }
                    // result += `${package} successfully removed`;
                    result += `Removing ${package}`;
                    result += '\n';
                    // console.log(`   ${package} successfully removed`);
                    if(!check) {
                        // graphObj.dependencies = new Set(Array.from(graphObj.dependencies).reverse())
                        graphObj.dependencies.forEach((eachDependencies) => {
                            // if(!visitedNodes.has(eachDependencies)) {
                                dfsRemove(eachDependencies, true);
                            // }
                        });
                    }
    
                    
                }
            } else {
                // console.log(`   ${package}  is not installed`);
                result += `${package}  is not installed`;
                result += '\n';
            }

        }

    };

    dfsRemove(packageName);

    return result;
}

const removeDependentObj = (packageName) => {
    const graphObj = dependenciesGraph.get(packageName);
    if(graphObj.dependencies.size > 0) {
        graphObj.dependencies.forEach((package) => {
            const currentGraphObj = dependenciesGraph.get(package);
            currentGraphObj.dependentUpon.delete(packageName);
        });
    }
}

const functionData = (input) => {


    let result = '';

    const commands = splitTextIntoArr(input);

    for(let i = 1; i < commands.length; i++) {

        const currentCommands = commands[i];
        const currentOperation = currentCommands[0];

        result += `${currentCommands.join(' ')}`;
        if(currentOperation !== 'END') {
            result += '\n';
        }
        

        if(currentOperation === 'DEPEND') {
            result += dependCommand(currentCommands);
        }

        if(currentOperation == 'INSTALL') {
            result += installCommand(currentCommands);
        }

        if(currentOperation == 'LIST') {
            result += ListCommand();
        }

        if(currentOperation == 'REMOVE') {
            const packageName = currentCommands[1];
            // removeCommand(packageName);
            result += removeCommand(packageName);
        }  
    }

    return result;
    // console.log(dependenciesGraph);
    // console.log('installPackages => ', installPackages);



};

// let input = "22\n" +
// "DEPEND TELNET TCPIP NETCARD\n" +
// "DEPEND TCPIP NETCARD\n" +
// "DEPEND DNS TCPIP NETCARD\n" +
// "DEPEND BROWSER TCPIP HTML\n" +
// "INSTALL NETCARD\n" +
// "INSTALL TELNET\n" +
// "INSTALL foo\n" +
// "REMOVE NETCARD\n" +
// "INSTALL BROWSER\n" +
// "INSTALL DNS\n" +
// "LIST\n" +
// "REMOVE TELNET\n" +
// "REMOVE NETCARD\n" +
// "REMOVE DNS\n" +
// "REMOVE NETCARD\n" +
// "INSTALL NETCARD\n" +
// "REMOVE TCPIP\n" +
// "LIST\n" +
// "REMOVE BROWSER\n" +
// "REMOVE TCPIP\n" +
// "LIST\n" +
// "END"

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

const finalResult = functionData(input);
console.log(finalResult);

