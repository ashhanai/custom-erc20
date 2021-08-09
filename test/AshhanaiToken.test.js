const AshhanaiToken = artifacts.require("AshhanaiToken");

contract("AshhanaiToken", async accounts => {
	let instance; 
	let [admin, alice, bob] = accounts;

	console.log("Accounts\n========");
	console.log(`Admin:\t${admin}`);
	console.log(`Alice:\t${alice}`);
	console.log(`Bob:\t${bob}`);

	beforeEach(async () => {
		instance = await AshhanaiToken.deployed()
	});

	describe("constructor", async () => {

		it("should set initial supply as total supply", async () => {
			const initialSupply = 1234567;

			const instance = await AshhanaiToken.new(initialSupply);

			const totalSupply = await instance.totalSupply();
			assert.equal(initialSupply, totalSupply.toNumber());
		});

		it("should set initial supply to admin", async () => {
			const initialSupply = 10;

			const instance = await AshhanaiToken.new(initialSupply);

			const adminBalance = await instance.balanceOf(admin);
			assert.equal(initialSupply, adminBalance.toNumber());
		});

		it("should emit Transfer event", async () => {
			const initialSupply = 1;
			const instance = await AshhanaiToken.new(initialSupply);

			const logs = await web3.eth.getPastLogs({
				address: instance.address
			});

			assert.equal(logs.length, 1);
			assert.equal(logs[0].topics[0], web3.eth.abi.encodeEventSignature("Transfer(address,address,uint256)")); // Keccak256 hash of event signature
			assert.equal(web3.utils.hexToNumberString(logs[0].topics[1]), web3.utils.hexToNumberString(0x0));
			assert.equal(web3.utils.hexToNumberString(logs[0].topics[2]), web3.utils.hexToNumberString(admin));
			assert.equal(web3.utils.hexToNumberString(logs[0].data), initialSupply);
		});

	});


	describe("meta-data", async () => {

		it("should have name", async () => {
			const name = await instance.name();

			assert.equal(name, "Ashhanai Token");
		});

		it("should have symbol", async () => {
			const name = await instance.symbol();

			assert.equal(name, "ASHT");
		});

		it("should have decimals", async () => {
			const name = await instance.decimals();

			assert.equal(name.toNumber(), 18);
		});

	});

	describe("transfer", async () => {

		it("should fail when insufficient balance", async () => {
			try {
				await instance.transfer(bob, 10, { from: alice });
				assert.fail();
			} catch(error) {
				assert(error.message.indexOf("revert") >= 0);
			}
		});

		it("should update balances", async () => {
			const adminOriginalBalance = await instance.balanceOf(admin);
			const bobOriginalBalance = await instance.balanceOf(bob);
			const amount = 10;

			await instance.transfer(bob, amount, { from: admin });

			const adminBalance = await instance.balanceOf(admin);
			const bobBalance = await instance.balanceOf(bob);
			assert.equal(adminBalance.toNumber(), adminOriginalBalance.toNumber() - amount);
			assert.equal(bobBalance.toNumber(), bobOriginalBalance.toNumber() + amount);
		});

		it("should emit Transfer event", async () => {
			const amount = 0;

			const result = await instance.transfer(bob, amount, { from: admin });

			assert.equal(result.logs.length, 1);
			assert.equal(result.logs[0].event, "Transfer");
			assert.equal(result.logs[0].args._from, admin);
			assert.equal(result.logs[0].args._to, bob);
			assert.equal(result.logs[0].args._value, amount);
		});

		it("should return true on success", async () => {
			const success = await instance.transfer.call(bob, 10, { from: admin });

			assert.equal(success, true);
		});

	});

	describe("approve", async () => {

		it("should set spender allowance", async () => {
			// First set
			const amount1 = 48;

			await instance.approve(alice, amount1, { from: admin });

			const adminAliceAllowance1 = await instance.allowance(admin, alice);
			assert.equal(adminAliceAllowance1.toNumber(), amount1);

			// Second set
			const amount2 = 10;

			await instance.approve(alice, amount2, { from: admin });

			const adminAliceAllowance2 = await instance.allowance(admin, alice);
			assert.equal(adminAliceAllowance2.toNumber(), amount2);
		});

		it("should emit Approval event", async () => {
			const amount = 8;

			const result = await instance.approve(alice, amount, { from: admin });

			assert.equal(result.logs.length, 1);
			assert.equal(result.logs[0].event, "Approval");
			assert.equal(result.logs[0].args._owner, admin);
			assert.equal(result.logs[0].args._spender, alice);
			assert.equal(result.logs[0].args._value, amount);
		});

		it("should return true on success", async () => {
			const success = await instance.approve.call(alice, 4, { from: admin });

			assert.equal(success, true);
		});

	});

	describe("transferFrom", async () => {

		beforeEach(async () => {
			await instance.approve(alice, 0, { from: bob });
		});

		it("should fail when insufficient balance", async () => {
			const bobBalance = await instance.balanceOf(bob);
			await instance.approve(alice, bobBalance, { from: bob });

			try {
				await instance.transferFrom(bob, alice, bobBalance.toNumber() + 1, { from: admin });
				assert.fail();
			} catch(error) {
				assert(error.message.indexOf("Unsufficient balance") >= 0);
			}
		});

		it("should fail when insufficient allowance", async () => {
			const bobBalance = await instance.balanceOf(bob);
			await instance.approve(alice, bobBalance - 9, { from: bob });

			try {
				await instance.transferFrom(bob, alice, bobBalance.toNumber() - 8, { from: admin });
				assert.fail();
			} catch(error) {
				assert(error.message.indexOf("Unsufficient allowance") >= 0);
			}
		});

		it("should update balance", async () => {
			const amount = 2;
			await instance.approve(alice, amount, { from: bob });
			const aliceOriginalBalance = await instance.balanceOf(alice);
			const bobOriginalBalance = await instance.balanceOf(bob);

			await instance.transferFrom(bob, alice, amount, { from: admin });

			const aliceBalance = await instance.balanceOf(alice);
			const bobBalance = await instance.balanceOf(bob);
			assert.equal(aliceBalance.toNumber(), aliceOriginalBalance.toNumber() + amount);
			assert.equal(bobBalance.toNumber(), bobOriginalBalance.toNumber() - amount);
		});

		it("should update allowance", async () => {
			const allowance = 4;
			const amount = 2;
			await instance.approve(alice, allowance, { from: bob });

			await instance.transferFrom(bob, alice, amount, { from: admin });

			const bobAliceAllowance = await instance.allowance(bob, alice);
			assert.equal(bobAliceAllowance.toNumber(), allowance - amount);
		});

		it("should emit Transfer event", async () => {
			const amount = 2;
			await instance.approve(alice, amount, { from: bob });

			const result = await instance.transferFrom(bob, alice, amount, { from: admin });

			assert.equal(result.logs.length, 1);
			assert.equal(result.logs[0].event, "Transfer");
			assert.equal(result.logs[0].args._from, bob);
			assert.equal(result.logs[0].args._to, alice);
			assert.equal(result.logs[0].args._value, amount);
		});

		it("should return true on success", async () => {
			const amount = 2;
			await instance.approve(alice, amount, { from: bob });

			const success = await instance.transferFrom.call(bob, alice, amount, { from: admin });

			assert.equal(success, true);
		});

	});

});
