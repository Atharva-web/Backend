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

console.log(name);