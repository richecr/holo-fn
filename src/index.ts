export * from "./maybe";

import { fromNullable } from "./";
import { pipe } from "rambda";

type User = { profile?: { name?: string } };

const getUserName = (user: User) =>
  pipe(
    fromNullable(user.profile),
    (m) => m.chain((p) => fromNullable(p.name)),
    (m) => m.getOrElse("Visitante")
  );

console.log(getUserName({}));
console.log(getUserName({ profile: { name: "Rich" } }));

const parsePrice = (input: string) =>
  fromNullable(parseFloat(input))
    .map((n) => (n > 0 ? n : null))
    .chain(fromNullable)
    .getOrElse(0);

console.log(parsePrice("20.5")); // 20.5
console.log(parsePrice("0")); // 0
console.log(parsePrice("abc")); // 0
console.log(parsePrice("-1.2")); // 0

const maybeUser = fromNullable<{ name: string }>(undefined);

const greeting = maybeUser.match({
  Just: (user) => `Olá, ${user.name}`,
  Nothing: () => "Usuário não encontrado",
});

console.log(greeting); // "Olá, Rich"

const list = [1, 3, 5];

const findEven = (xs: number[]) =>
  fromNullable(xs.find((x) => x % 2 === 0))
    .map((x) => x * 10)
    .getOrElse(-1);

console.log(findEven(list)); // 20
