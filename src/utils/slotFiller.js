function slotFiller(slotDataGiven, AllSlots) {
	if (slotDataGiven.length && AllSlots.length) {
		for (const slot of slotDataGiven) {
			AllSlots = AllSlots.filter((ele) => ele !== slot);
		}
	}
	let conditionNextToAsk = AllSlots[0] ? AllSlots[0] : "finalMessage";
	console.log(conditionNextToAsk);
	return conditionNextToAsk;
}

module.exports = { slotFiller };
