const filename = process.argv[2]
const fs = require('fs')

fs.readFile(filename, 'utf-8', function(err, inpStr) {
            if(err) throw err
            let value = expressionParser(inpStr)
            value = (value) ? value[0] : "Invalid"
            console.log(value);
          })

function expressionParser(input) {
  const parsers = [boolParser, numParser, stringParser, quoteParser, symbolParser ,s_expressionParser]
  return (parserFactory(input, parsers))
}

function parserFactory(data, parsers) {
  for(let i = 0; i < parsers.length; i++) {
    let result = parsers[i](data)
    if(result != null) return result
  }
  return result
}

const defaultEnv = {
  '+' : add = function(args) { return (result = args.reduce(function(sum, value) { return (sum + value) }))},
  '-' : sub = function(args) { return (result = args.reduce(function(diff, value) { return (diff - value) }))},
  '*' : mul = function(args) { return (result = args.reduce(function(prod, value) { return (prod * value) }))},
  '/' : div = function(args) { return (result = args.reduce(function(quot, value) { return (quot / value) }))},
  '<' : lesser = function(args) { return (args[0] < args[1] ? true : false)},
  '>' : greater = function(args) { return (args[0] > args[1] ? true : false)},
  '=' : equals = function(args) { return (args[0] === args[1] ? true : false)},
  '<=' : lesserOrEqual = function(args) { return (args[0] <= args[1] ? true : false)},
  '>=' : greaterOrEqual = function(args) { return (args[0] >= args[1] ? true : false)},
  'define' : define = function(args) { defaultEnv[args[0] = args[1]]
                                       return(args[1])},
  'if' : condn = function(args) { return (result = args[0] ? args[1] : args[2])},
  'list' : lists = function(args) { return args},
  'car' : car = function(args) { return args[0][0]},
  'cdr' : cdr = function(args) { return args[0].slice(1)},
  'cons' : cons = function(args) { args[1].push(args[0])
                                   return args[1]},
  'print' : print = function(args) {return args[0]}
}

function s_expressionParser(input) {
  if(input[0] != '(') return null
  input = input.slice(1)
  let resultArray = []
  while(input[0] != ')') {
    input = ((spaceParsedData = spaceParser(input)) != null) ? spaceParsedData[1] : input
    let foo = expressionParser(input)
    if(foo) {resultArray.push(foo[0])
      input = foo[1]}
    else {
      let i = input.indexOf(" ")
      resultArray.push(input.slice(0, i))
      input = input.slice(i)
      }
    input = ((spaceParsedData = spaceParser(input)) != null) ? spaceParsedData[1] : input
    if(input[0] === ')') break
    let temp = expressionParser(input)
    //console.log("temp "+temp[0], temp[1]);
    if(temp) {
      resultArray.push(temp[0])
      input = temp[1]
    }
  }
  let result = funcEvaluator(resultArray, defaultEnv)
  input = input.slice(1)
  return ((result) ? ([result, input]) : (resultArray[0], input))
}

const spaceParser = function(input) {return (((/^(\s)+/).test(input)) ? ([' ', input.replace(/^(\s)+/, '')]) : null)}

function quoteParser(input) {
  if(input[0] != "'") return null
  let i = input.indexOf(")")
  let result = input.slice(1).substr(0, i+1)
  return([result, input.slice(result+1)])
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
  if (input[0] !== '"') return null
  let i = input.slice(1).search(/"(\s|\))+/)
  let parsedString = input.slice(1,i+1)
  let resData = input.slice(i+2)
  return (((spaceParsedData = spaceParser(resData)) !== null) ? ([parsedString, spaceParsedData[1]]) : ([parsedString, resData]))
}

function symbolParser(input) {
  let parsedName = (/^[a-zA-Z]+/).exec(input)
  if(parsedName) {
    parsedName = parsedName[0]
    let resData = input.slice(parsedName.length)
    return([parsedName, resData])
  }
  return null
}

const boolParser = function(input) {
  if(input[0] === 'T')
    return (((spaceParsedData = spaceParser(input.slice(1))) !== null) ? ([true, spaceParsedData[1]]) : ([true, input.slice(1)]))
  else if(input.substr(0, 3) === 'NIL')
    return (((spaceParsedData = spaceParser(input.slice(3))) !== null) ? ([false, spaceParsedData[1]]) : ([false, input.slice(3)]))
  else return null
}

function funcEvaluator(input, env) {
  if (input.length === 0) return 'NIL'
  if (input.length === 1) return input[0]
  let func = input[0], result = null
  input.shift()
  let key = Object.keys(env)
  for(let i = 0; i < key.length; i++) {
    if(func == key[i])
      func = env[key[i]]
  }
  return func(input)
}
