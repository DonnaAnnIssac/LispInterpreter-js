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
  let result = parserFactory(input)
  if(result.length != 0) {
    let resultArray = result[0](input)
    return resultArray
  }
  return null
}

function parserFactory(data) {
  const parsers = [numParser, stringParser, s_expressionParser, identifierParser]
  let result = parsers.filter(function(parser) {
                        if(parser(data) != null) return parser
                      })
  return result
}

let globalEnv = {}

const defaultEnv = {
  '+' : add = function(args) { return (result = args.reduce(function(sum, value) { return (sum + value) }))},
  '-' : sub = function(args) { return (result = args.reduce(function(diff, value) { return (diff - value) }))},
  '*' : mul = function(args) { return (result = args.reduce(function(prod, value) { return (prod * value) }))},
  '/' : div = function(args) { return (result = args.reduce(function(quot, value) { return (quot / value) }))},
  '<' : lesser = function(args) { return (args[0] < args[1] ? 'T' : 'NIL')},
  '>' : greater = function(args) { return (args[0] > args[1] ? 'T' : 'NIL')},
  '=' : equals = function(args) { return (args[0] === args[1] ? 'T' : 'NIL')},
  '<=' : lesserOrEqual = function(args) { return (args[0] <= args[1] ? 'T' : 'NIL')},
  '>=' : greaterOrEqual = function(args) { return (args[0] >= args[1] ? 'T' : 'NIL')},
  'define' : define = function(args) { defaultEnv[args[0] = args[1]]
                                       return(args[1])},
  'if' : condn = function(args) {return (result = args[0] ? args[1] : args[2])},
}
function s_expressionParser(input) {
  if(input[0] != '(') return null
  input = input.slice(1)
  let resultArray = []
  while(input[0] != ')') {
    if(resultArray.length == 0) {
      let i = input.indexOf(" ")
      resultArray.push(input.slice(0, i))
      input = input.slice(i)
    }
    let spaceParsedData = null
    if((spaceParsedData = spaceParser(input)) != null)
      input = spaceParsedData[1]
    let temp = expressionParser(input)
    resultArray.push(temp[0])
    input = temp[1]
  }
  let result = funcEvaluator(resultArray)
  input = input.slice(1)
  return ([result, input])
}

function spaceParser(input) {
  if(input.startsWith(' ')) {
    input = input.replace(/^(\s)+/, '')
    return([' ', input])
  }
  return null
}

function numParser(input) {
  let parsedNum = (/^[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?/).exec(input)
  if(parsedNum) {
    parsedNum = parsedNum[0]
    let resData = input.slice(parsedNum.length)
    parsedNum = parseInt(parsedNum)
    return ([parsedNum, resData])
  }
  return null
}

function stringParser(input) {
  if (input[0] != '"') {
    return null
  }
  let i = input.slice(1).indexOf('"'), spaceParsedData = null
  let parsedString = input.slice(1,i+1).toString()
  let resData = input.slice(i+2)
  if((spaceParsedData = spaceParser(resData)) != null)
    return ([parsedString, spaceParsedData[1]])
  return([parsedString, resData])
}

function identifierParser(input) {
  let parsedName = (/^[a-zA-Z]+/).exec(input)
  if(parsedName) {
    parsedName = parsedName[0]
    let resData = input.slice(parsedName.length)
    return([parsedName, resData])
  }
  return null
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
