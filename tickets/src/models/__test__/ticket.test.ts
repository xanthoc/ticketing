import { Ticket } from "../ticket";

it("fails to save if the version is not current", async (done) => {
  const ticket = Ticket.build({
    title: "title",
    price: 11,
    userId: "abcd",
  });
  await ticket.save();

  const first = await Ticket.findById(ticket.id);
  const second = await Ticket.findById(ticket.id);

  first?.set({ price: 22 });
  await first?.save();

  second?.set({ price: 33 });
  try {
    await second?.save();
  } catch (err) {
    return done();
  }
  throw new Error("This shall not be reached");
});

it("increases the version number", async () => {
  const ticket = Ticket.build({
    title: "title",
    price: 11,
    userId: "abcd",
  });
  await ticket.save();
  expect(ticket.version).toEqual(0);
  await ticket.save();
  expect(ticket.version).toEqual(1);
  await ticket.save();
  expect(ticket.version).toEqual(2);
});
