// console.log() and see everything.

/*
// the task is to ask shake everyone's hand
// before greeting them

function goodMorning(name) {
    return `Good Morning, ${name}!`;
}

function goodAfternoon(name) {
    return `Good Afternoon, ${name}!`;
}

function greet(greetings) {
    return function(name) {
        return `(shaking hand...) ${greetings(name)}`;
    }
}

let res = greet(goodAfternoon)("Atharva");
console.log(res);


const asyncHandler = (fn) => {
    async (req, res, next) => {
        try {
            await fn(req, res, next);
    }
        catch(error) {
            res.status(error.code || 500).json({
                success: false,
                message: error.message             
            });
        }
    }
}

*/

const person = {
    name: "Atharva",
    age: 21
};

// store props in variables
// const name = person.name;
// const age = person.age;

// object destructuring
const { name, age } = person;

console.log(age);


// if a property has a value of undefined, it won't show up in respose
// so if there is a possibility of getting undefined, || it with ""

// db calls ko reduce karo
// variables mein store karo

// another js concept
function foo() {
    const rt = "t1";
    const at = "t2";
    return { rt, at };
}

const val = foo();

console.log(val); // { rt: "t1", rt: "t2" }

// when passing { username } as argument, it is shorthand for { username: username }