const filename = process.argv[2]
const fs = require('fs')

fs.readFile(filename, 'utf-8', function(err, inpStr) {
            if(err) throw err
            programParser(inpStr)})

function programParser(input) {
  while(input[0] !== ')') {
    let result = expressionParser(input)
    result = (result) ? result : "Invalid"
    if(result[0] !== undefined) console.log(result[0])
    input = result[1]
  }
  return
}
const defaultEnv = {
  '+' : add = function(args) { return (result = args.reduce(function(sum, value) { return parseFloat(sum + value) }))},
  '-' : sub = function(args) { return (result = args.reduce(function(diff, value) { return parseFloat(diff - value) }))},
  '*' : mul = function(args) { return (result = args.reduce(function(prod, value) { return parseFloat(prod * value) }))},
  '/' : div = function(args) { return (result = args.reduce(function(quot, value) { return parseFloat(quot / value) }))},
  '<' : lesser = function(args) { return (args[0] < args[1] ? true : false)},
  '>' : greater = function(args) { return (args[0] > args[1] ? true : false)},
  '=' : equals = function(args) { return (args[0] === args[1] ? true : false)},
  '<=' : lesserOrEqual = function(args) { return (args[0] <= args[1] ? true : false)},
  '>=' : greaterOrEqual = function(args) { return (args[0] >= args[1] ? true : false)},
  'list' : lists = function(args) { return args},
  'car' : car = function(args) { return args[0][0]},
  'cdr' : cdr = function(args) { return args[0].slice(1)},
  'cons' : cons = function(args) { args[1].push(args[0])
                                   return args[1]},
  'print' : print = function(args) { console.log(args.toString()) }
}

var globalEnv = {}

const s_expressionParser = function (input) {
  if(input[0] !== '(') return null
  input = (spaceParsedData = spaceParser(input.slice(1)) !== null) ? spaceParsedData[1] : input.slice(1)
  let resultArray = specialParsers(input), temp
  if(resultArray !== null) return resultArray
  resultArray = []
  while(input[0] !== ')') {
    input = ((spaceParsedData = spaceParser(input)) !== null) ? spaceParsedData[1] : input
    if(input[0] === ')') break
    temp = expressionParser(input)
    if(!temp) return null
    if(temp[0] !== undefined) resultArray.push(temp[0])
    input = temp[1]
  }
  if(resultArray.length === 0) return
  if (resultArray.length === 1) return ([resultArray[0], input])
  let result = funcEvaluator(resultArray, defaultEnv)
  input = (spaceParsedData = spaceParser(input) !== null) ? spaceParsedData[1] : input
  return ((result !== null) ? ([result, input]) : null)
}

const ifParser = function(input) {
  if(input.substr(0, 2) !== 'if') return null
  let condition = expressionParser(input.slice(3))
  input = ((spaceParsedData = spaceParser(condition[1])) !== null) ? spaceParsedData[1] : condition[1]
  if (condition[0]) return expressionParser(input)
  if (!condition[0]) {
    let i = (input[0] === '(') ? input.indexOf(')'): input.indexOf(' ')
    input = ((spaceParsedData = spaceParser(input.slice(i+1))) !== null) ? spaceParsedData[1] : input.slice(i+1)
    return (input[0] === ')') ? (['NIL', input.slice(1)]) : expressionParser(input)
  }
}

const defParser = function(input) {
  if(input.substr(0, 6) !== 'define') return null
  let identifier = symbolParser(input.slice(7)), result
  if(identifier === null) return ([null, input])
  input = ((spaceParsedData = spaceParser(identifier[1])) !== null) ? spaceParsedData[1] : identifier[1]
  if((result = lambdaParser(input.slice(1))) !== null) {
    globalEnv[identifier[0]] = result[0]
    result = ((spaceParsedData = spaceParser(result[1].slice(1)))!== null) ? spaceParsedData[1] : result[1].slice(1)
    return ([ , result])
  }
  let value = expressionParser(input)
  if (value !== null) {
    globalEnv[identifier[0]] = value[0]
    value = ((spaceParsedData = spaceParser(value[1].slice(1))) !== null) ? spaceParsedData[1] : value[1].slice(1)
    return([ ,value])}
  return ([null, input])
}

const lambdaParser = function(input) {
  if(input.substr(0, 6) !== 'lambda') return null
  let formals = [], fnObj = {}
  input = input.slice(8)
  while(input[0] != ')'){
    let item = expressionParser(input)
    formals.push(item[0])
    input = item[1]
  }
  fnObj.type = "lambda"
  fnObj.args = formals
  input = ((spaceParsedData = spaceParser(input.slice(1))) !== null) ? spaceParsedData[1] : input.slice(1)
  funcBody = input.slice(0, (input.indexOf('))') + 1))
  fnObj.body = funcBody
  fnObj.env = {}
  input = ((spaceParsedData = spaceParser(input.slice(funcBody.length)) !== null) ? spaceParsedData[1] : input.slice(funcBody.length+1))
  input = ((spaceParsedData = spaceParser(input.slice(1)) !== null) ? spaceParsedData[1] : input.slice(1))
  if(input[0] !== ')' && input[0] !== '(') {
    let params = []
  while(input[0] !== ')' && input[0] !== '(') //if parameters passed directly to lambda
    {
      let temp = expressionParser(((spaceParsedData = spaceParser(input)) !== null) ? spaceParsedData[1] : input)
      params.push(temp[0])
      input = temp[1]
    }
    result = procEvaluator(fnObj, params)
    return([result, input])
   }
  return ([fnObj, input])
}

const spaceParser = function(input) {return (((/^(\s|\n)+/).test(input)) ? ([' ', input.replace(/^(\s|\n)+/, '')]) : null)}

const numParser = function(input) {
  let parsedNum = (/^[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?/).exec(input)
  if(parsedNum) {
    parsedNum = parsedNum[0]
    let resData = input.slice(parsedNum.length)
    parsedNum = parseFloat(parsedNum)
    return ([parsedNum, resData])
  }
  return null
}

const stringParser = function (input) {
  if (input[0] !== '"') return null
  let i = input.slice(1).search(/"(\s|\))/)
  let parsedString = input.slice(1,i+1)
  let resData = input.slice(i+3)
  return (((spaceParsedData = spaceParser(resData)) !== null) ? ([parsedString, spaceParsedData[1]]) : ([parsedString, resData]))
}

const boolParser = function(input) {
  if(input[0] === 'T')
    return (((spaceParsedData = spaceParser(input.slice(1))) !== null) ? ([true, spaceParsedData[1]]) : ([true, input.slice(1)]))
  if(input[0].substr(0, 3) === 'NIL')
    return (((spaceParsedData = spaceParser(input.slice(3))) !== null) ? ([false, spaceParsedData[1]]) : ([false, input.slice(3)]))
  return null
}

const symbolParser = function (input) {
  let parsedName = (/^[a-zA-Z'=+\-*\/\<\>]+/).exec(input)
  if(parsedName) {
    parsedName = parsedName[0]
    let resData = input.slice(parsedName.length)
    return(((spaceParsedData = spaceParser(resData)) !== null) ? ([parsedName, spaceParsedData[1]]) : ([parsedName, resData]))
  }
  return null
}

function anyParserFactory(...parsers) {
  return function(input) {
    for(let i = 0; i < parsers.length; i++) {
      let result = parsers[i](input)
      if(result !== null)return result
    }
  return null
  }
}

const expressionParser = anyParserFactory(boolParser, numParser, stringParser, symbolParser, s_expressionParser)
const specialParsers = anyParserFactory(ifParser, defParser, lambdaParser)

function funcEvaluator(input, env) {
  if (input.length === 0) return 'NIL'
  if (input.length === 1) return null
  let func = input[0], flag = 0, args = input.slice(1)
  for(let i = 0; i < args.length; i++) {
    if(symbolParser(args[i]) !== null && globalEnv[args[i]] !== undefined)
      args[i] = globalEnv[args[i]]
  }

  return (env.hasOwnProperty(func) ? env[func](args) : procEvaluator(func, args))
}

function procEvaluator(func, args) {
  func = globalEnv.hasOwnProperty(func) ? globalEnv[func] : func
  if(func.args.length !== args.length) return null
  let arr = func.args, str = func.body
  for(let i = 0; i < args.length; i++)
    func.env[arr[i]] = args[i]

  for (let argName of arr) {
      str = str.replace(new RegExp(argName, 'g'), func.env[argName])
  }
  let result = s_expressionParser(str)
  return result[0]
}
