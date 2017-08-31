const filename = process.argv[2]
const fs = require('fs')

fs.readFile(filename, 'utf-8', function(err, inpStr) {
            if(err) throw err
            let value = expressionParser(inpStr)
            if(value)
              console.log(value[0]);
            else
            console.log("Invalid");
          })

function expressionParser(input) {
  console.log("expressionParser");
  let result = parserFactory(input)
  if(result.length != 0) {
    let resultArray = result[0](input)
    console.log("Returning "+resultArray);
    return resultArray
  }
  return null
}

function parserFactory(data) {
  console.log("parserFactory");
  const parsers = [numParser, stringParser, s_expressionParser, boolParser, nilParser, identifierParser]
  let result = parsers.filter(function(parser) {
                        if(parser(data) != null) return parser
                      })
  console.log("Returning from pf");
  return result
}

let globalEnv = {}

const defaultEnv = {
  '+' : add = function(args) { return (result = args.reduce(function(sum, value) { return (sum + value) }))},
  '-' : sub = function(args) { return (result = args.reduce(function(diff, value) { return (diff - value) }))},
  '*' : mul = function(args) { return (result = args.reduce(function(prod, value) { return (prod * value) }))},
  '/' : div = function(args) { return (result = args.reduce(function(quot, value) { return (quot / value) }))},
  'setq' : setVar = function(args) {  globalEnv[args[0] = args[1]]
                                      return(args[1])
                                   }
}

function s_expressionParser(input) {
  if(input[0] != '(') return null
  console.log("s_expressionParser");
  input = input.slice(1)
  let resultArray = []
  while(input[0] != ')') {
    if(resultArray.length == 0) {
      let i = input.indexOf(" ")
      resultArray.push(input.slice(0, i))
      console.log(resultArray);
      input = input.slice(i)
    }
    let spaceParsedData = null
    if((spaceParsedData = spaceParser(input)) != null)
      input = spaceParsedData[1]
    let temp = expressionParser(input)
    resultArray.push(temp[0])
    input = temp[1]
    //console.log("Result array "+resultArray);
  }
  let result = funcEvaluator(resultArray)
  input = input.slice(1)
  console.log("Returning from s_exp"+result,input);
  return ([result, input])
}

function spaceParser(input) {
  console.log("spaceParser");
  if(input.startsWith(' ')) {
    input = input.replace(/^(\s)+/, '')
    //console.log("Returning "+input);
    return([' ', input])
  }
  return null
}

function numParser(input) {
  let parsedNum = (/^[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?/).exec(input)
  if(parsedNum) {
    console.log("numParser");
    parsedNum = parsedNum[0]
    let resData = input.slice(parsedNum.length)
    parsedNum = parseInt(parsedNum)
    console.log("Returning from nP"+parsedNum,resData);
    return ([parsedNum, resData])
  }
  return null
}

function stringParser(input) {
  if (input[0] != '"') {
    return null
  }
  //console.log("stringParser");
  let i = input.slice(1).indexOf('"'), spaceParsedData = null
  let parsedString = input.slice(1,i+1).toString()
  let resData = input.slice(i+2)
  if((spaceParsedData = spaceParser(resData)) != null)
    return ([parsedString, spaceParsedData[1]])
  return([parsedString, resData])
}

/*function boolParser(input) {
  if(input[0] == 't')
    return([true, input.slice(1)])
  else if (input.substr(0,3) == 'NIL')
    return ([false, input.slice(3)])
  return null
}

function nilParser(input) {
  if(input[0] == ')'){console.log("nilParser");return(["NIL", input.slice(1)])}
}*/

function identifierParser(input) {
  let parsedName = (/^[a-zA-Z]+/).exec(input)
  if(parsedName) {
    console.log("identifierParser");
    parsedName = parsedName[0]
    console.log(parsedName);
    let resData = input.slice(parsedName.length)
    console.log(resData);
    return([parsedName, resData])
  }
  return null
}

function atomParser(input) {
  if(input.startsWith())
}
function funcEvaluator(input) {
  //console.log("funcEvaluator");
  let func = input[0], result = null
  input.shift()
  let key = Object.keys(defaultEnv)
  for(let i = 0; i < key.length; i++) {
    if(func == key[i])
      func = defaultEnv[key[i]]
  }
  result = func(input)

  return result
}
