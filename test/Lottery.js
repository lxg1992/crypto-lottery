const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect } = require("chai");
  
  describe("Contract", function () {
    const entryFee = ethers.utils.parseUnits("0.01", "ether");
    const wrongFee = ethers.utils.parseUnits("1", "ether");

    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function simpleDeployFixture() {
    //   const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
    //   const ONE_GWEI = 1_000_000_000;
  
    //   const lockedAmount = ONE_GWEI;
    //   const unlockTime = (await time.latest()) + ONE_YEAR_IN_SECS;
  
      // Contracts are deployed using the first signer/account by default
      const [owner, nonOwner1, nonOwner2, nonOwner3] = await ethers.getSigners();
  
      const Lottery = await ethers.getContractFactory("Lottery");
      const lottery = await Lottery.deploy();
  
      return { lottery, owner, nonOwner1, nonOwner2, nonOwner3 };
    }
  
    describe("Lottery", function () {
      it("Should set the right owner address", async function () {
        const { lottery, owner } = await loadFixture(simpleDeployFixture);
        expect(await lottery.getOwner()).to.equal(owner.address);
      });
  
    //   it("Should set the right owner", async function () {
    //     const { lock, owner } = await loadFixture(deployOneYearLockFixture);
  
    //     expect(await lock.owner()).to.equal(owner.address);
    //   });
  
      it("Should have 0.03 eth after 3 players enter", async function () {
        const total = ethers.utils.parseUnits("0.03", "ether");
        const { lottery,  owner, nonOwner1, nonOwner2, nonOwner3 } = await loadFixture(
          simpleDeployFixture
        );

        await lottery.connect(nonOwner1).enterLottery({value: entryFee});
        await lottery.connect(nonOwner2).enterLottery({value: entryFee});
        await lottery.connect(nonOwner3).enterLottery({value: entryFee});
  
        expect(await ethers.provider.getBalance(lottery.address)).to.equal(
          total
        );
      });

      it("Should not let a player enter twice per round", async () => {
        const { lottery,  owner, nonOwner1, nonOwner2, nonOwner3 } = await loadFixture(
          simpleDeployFixture
        );
        await lottery.connect(nonOwner1).enterLottery({value: entryFee});

        await expect(lottery.connect(nonOwner1).enterLottery({value: entryFee})).to.be.revertedWith('Already entered');
      });

      it("Should not let a player enter with wrong fee", async () => {
        const { lottery,  nonOwner1} = await loadFixture(
          simpleDeployFixture
        );
        await expect(lottery.connect(nonOwner1).enterLottery({value: wrongFee})).to.be.revertedWith('Fee must be 0.01eth');
      });

      it("Should not have a past winner with no entrants", async () => {
        const { lottery } = await loadFixture(
          simpleDeployFixture
        );
        await expect(lottery.lastWinner()).to.be.revertedWith('No past winner!');
      });

      it("Should detect the last winner correctly", async () => {
        const { lottery, nonOwner1 } = await loadFixture(simpleDeployFixture);

        await lottery.connect(nonOwner1).enterLottery({value: entryFee});

        await lottery.pickWinner();
        await expect(await lottery.lastWinner()).to.equal(nonOwner1.address);
      })
    });
  });
  