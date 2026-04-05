export const EXAMPLES = [
  {
    label: 'Hello World',
    code: `let greeting = "Hello";
let subject = "World";
let message = greeting + " " + subject + "!";

puts(message);
`
  },
  {
    label: 'Basics: Arithmetic & Comparisons',
    code: `puts("2 + 3 * 4 =");
puts(2 + 3 * 4);

puts("(10 - 3) / 7 =");
puts((10 - 3) / 7);

puts("5 > 2:");
puts(5 > 2);

puts("5 == 2:");
puts(5 == 2);
`
  },
  {
    label: 'Basics: If / Else',
    code: `let x = 7;

if (x > 10) {
  puts("big");
} else {
  puts("small");
}

puts("done");
`
  },
  {
    label: 'Functions: Add & Return',
    code: `let add = fn(a, b) {
  return a + b;
};

puts("add(10, 32) =");
puts(add(10, 32));
`
  },
  {
    label: 'Closures: Make Adder',
    code: `let makeAdder = fn(x) {
  return fn(y) { x + y; };
};

let addTwo = makeAdder(2);
let addTen = makeAdder(10);

puts("addTwo(40) =");
puts(addTwo(40));

puts("addTen(5) =");
puts(addTen(5));
`
  },
  {
    label: 'Strings: len() and Concatenation',
    code: `let a = "Monkey";
let b = "Playground";

puts(a + " " + b);
puts("len(Monkey) =");
puts(len(a));
`
  },
  {
    label: 'Fibonacci',
    code: `let fib = fn(n) {
  if (n < 2) {
    return n;
  }

  return fib(n - 1) + fib(n - 2);
};

puts("fib(10):");
puts(fib(10));
`
  },
  {
    label: 'Recursion: Factorial',
    code: `let fact = fn(n) {
  if (n == 0) {
    return 1;
  }
  return n * fact(n - 1);
};

puts("fact(6):");
puts(fact(6));
`
  },
  {
    label: 'Arrays: Basics (Indexing, len)',
    code: `let arr = [10, 20, 30, 40];

puts("arr:");
puts(arr);

puts("len(arr):");
puts(len(arr));

puts("arr[0] + arr[3] =");
puts(arr[0] + arr[3]);
`
  },
  {
    label: 'Arrays: first / last / rest / push',
    code: `let arr = [1, 2, 3];

puts("first:");
puts(first(arr));

puts("last:");
puts(last(arr));

puts("rest:");
puts(rest(arr));

puts("push 4:");
puts(push(arr, 4));
`
  },
  {
    label: 'Higher-Order Functions',
    code: `let isDivBy = fn(n, d) {
  return (n - (n / d) * d) == 0;
};

let mapAcc = fn(arr, f, acc) {
  if (len(arr) == 0) {
    return acc;
  }

  let item = first(arr);
  return mapAcc(rest(arr), f, push(acc, f(item)));
};

let map = fn(arr, f) {
  return mapAcc(arr, f, []);
};

let filterAcc = fn(arr, pred, acc) {
  if (len(arr) == 0) {
    return acc;
  }

  let item = first(arr);

  if (pred(item)) {
    return filterAcc(rest(arr), pred, push(acc, item));
  }

  return filterAcc(rest(arr), pred, acc);
};

let filter = fn(arr, pred) {
  return filterAcc(arr, pred, []);
};

let numbers = [1, 2, 3, 4, 5, 6];

let doubled = map(numbers, fn(x) { x * 2; });
let evens = filter(numbers, fn(x) { isDivBy(x, 2); });

puts("doubled:");
puts(doubled);
puts("evens:");
puts(evens);
`
  },
  {
    label: 'Array Program: Sum (Recursive)',
    code: `let sum = fn(arr) {
  if (len(arr) == 0) {
    return 0;
  }
  return first(arr) + sum(rest(arr));
};

let nums = [1, 2, 3, 4, 5];

puts("nums:");
puts(nums);
puts("sum(nums):");
puts(sum(nums));
`
  },
  {
    label: 'Mini Program: FizzBuzz (1..20, Recursive)',
    code: `let isDivBy = fn(n, d) {
  return (n - (n / d) * d) == 0;
};

let fizzbuzz = fn(i, n) {
  if (i > n) {
    return 0;
  }

  if (isDivBy(i, 15)) {
    puts("FizzBuzz");
  } else {
    if (isDivBy(i, 3)) {
      puts("Fizz");
    } else {
      if (isDivBy(i, 5)) {
        puts("Buzz");
      } else {
        puts(i);
      }
    }
  }

  return fizzbuzz(i + 1, n);
};

puts("FizzBuzz 1..20:");
fizzbuzz(1, 20);
`
  },
  {
    label: 'Hash Maps',
    code: `let h = {
  "language": "Monkey",
  10: "ten",
  true: "yes",
  false: "no"
};

puts(h["language"]);
puts(h[10]);
puts(h[true]);
puts(h[false]);
`
  },
  {
    label: 'Hash Maps: Counting Words',
    code: `let countWord = fn(words, target) {
  if (len(words) == 0) {
    return 0;
  }

  let head = first(words);
  let tail = rest(words);

  if (head == target) {
    return 1 + countWord(tail, target);
  }

  return countWord(tail, target);
};

let words = ["monkey", "banana", "monkey", "monkey", "ape", "banana"];
let counts = {
  "monkey": countWord(words, "monkey"),
  "banana": countWord(words, "banana"),
  "ape": countWord(words, "ape")
};

puts("words:");
puts(words);
puts("counts:");
puts(counts);
puts("count(monkey):");
puts(counts["monkey"]);
`
  },
  {
    label: 'Hash Maps: Mixed Keys + Computation',
    code: `let data = {
  "x": 5,
  "y": 12,
  1: 100,
  true: 7
};

puts("x + y:");
puts(data["x"] + data["y"]);

puts("1 + true:");
puts(data[1] + data[true]);
`
  }
];
