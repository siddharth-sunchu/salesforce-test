const dependCommand = (dependenciesMap, commands) => {
    const dependentUpon = commands[0];
    const dependentList = commands.slice(1, commands.length);
    
    if(!dependenciesMap.has(dependentUpon)) {
        const list = new Set(dependentList);
        dependenciesMap.add(dependentUpon, list);

    }

};

module.exports = dependCommand;