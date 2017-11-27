const helpers = {
  isEquipmentWorking() {
    if (!this.properties) return null;
    if (this.calculateEquipmentIsWorkingFromDates() === false) {
      return false;
    }
    if (typeof this.properties.isEquipmentWorking === 'boolean') {
      return this.properties.isEquipmentWorking;
    }
    return undefined;
  },

  // returns false if the equipment is not working according to given dates, undefined otherwise.
  calculateEquipmentIsWorkingFromDates() {
    if (!this.properties) return null;
    const { outOfServiceOn, outOfServiceTo, plannedCompletion } = this.properties;
    const now = Date.now();
    let fromDate = 0;
    let toDate = +Infinity;
    if (outOfServiceOn) fromDate = +new Date(outOfServiceOn);
    if (plannedCompletion) toDate = +new Date(plannedCompletion);
    if (outOfServiceTo) toDate = +new Date(outOfServiceTo);
    if (now >= fromDate && now < toDate) {
      return false;
    }
    return undefined; // if this disruption ended, we don't know if there is no other disruption
  },
};

export default helpers;
