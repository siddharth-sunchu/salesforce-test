const splitTextIntoArr = (str) => {
    return str.split("\n").map((eachCommand) => eachCommand.split(' '));
};

module.exports = splitTextIntoArr;