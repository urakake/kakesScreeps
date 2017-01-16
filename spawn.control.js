// Move & Repair
//Make Movers into Drones

function spawnNextUnit(spawn) {
	if (!spawn.spawning && spawn.room.energyAvailable >= 200) {
		var types = ['Drone', 'Miner', 'Claimer', 'Slave', 'Guard', 'Healer'];
		for (let i in types) {
			var type = types[i];
			if (checkCreeps(spawn.room, type)) {
				makeCreep(spawn, type);
			}
		}
	}
}

checkCreeps: function (myRoom, type) {
	var foundMissing = false;
	switch (type) {
		
	case "Drone": {
		var targets = myRoom.find(FIND_CONSTRUCTION_SITES);
	if (targets.length < 2) {
		if (myRoom.memory.numDrones < 1) {
			var foundMissing = true;
		}
	} else if (targets.length < 6) {
		if (myRoom.memory.numDrones < 1) {
			var foundMissing = true;
		}
	} else {
		if (myRoom.memory.numDrones < 2) {
			var foundMissing = true;
		}
	};
	break; }
		
	case "Miner": {
		if(getMissingMinerSourceId(myRoom) != undefined){
            foundMissing=true;
        } else {
		for (var i in spawn.room.memory.miningRooms) { //   look in  mining rooms
				myRoom = Game.rooms[spawn.room.memory.miningRooms[i]];
				if (myRoom != undefined && !foundMissing) {
					if (roleMiner.checkMiners(myRoom)) {
						foundMissing = true;
						roleMiner.makeMiner(spawn);
					} else if (roleMover.checkMovers(myRoom)) {
						roleMover.makeMover(spawn);
						foundMissing = true;
					}
				}
		}
		};
	break; }
		
	case "Claimer": {
        if(getMissingClaimerRoom(myRoom)!=undefined){
            foundMissing=true
        };
	break; }
		
	case "Slave": {
		if(myRoom.memory.numSlaves<2){
	        var targets = myRoom.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_STORAGE || structure.structureType == STRUCTURE_LINK || structure.structureType == STRUCTURE_CONTAINER)
                }
            });
            if (targets.length>0){
                var closestBox=myRoom.controller.pos.findClosestByRange(targets);
                if (myRoom.controller.pos.inRangeTo(closestBox, 8)){
                    if(closestBox.store[RESOURCE_ENERGY]>0){
                        foundMissing=true;
                    }
                }
            }
	    };
	break; }
		
	case "Guard": {
		if(getMissingGuardRoom(myRoom)!=undefined){
            foundMissing=true
		};
	break; }
		
	case "Healer": {
		if(getMissingHealerRoom(myRoom)!=undefined){
            foundMissing=true
		};
	break; }
		
	default: {
		console.log('Invalid creep type');
		break;
	}
			
}return foundMissing;

function makeBestBody(cap, type) {
	var body = [];
	//[MOVE, CARRY, WORK, CLAIM, TOUGH, ATTACK, RANGED_ATTACK, HEAL]
	var partCost = [50, 50, 100, 600, 10, 80, 150, 250];
	var partWeightRoads = [-2, 1, 1, 1, 1, 1, 1, 1];
	var partWeightPlains = [-2, 2, 2, 2, 2, 2, 2, 2];
	var partWeightSwamps = [-2, 10, 10, 10, 10, 10, 10, 10];

	var fracDrone = [25, 25, 50, 0, 0, 0, 0, 0];
	var maxDrone = [100, 100, 100, 0, 0, 0, 0, 0];
	var minDrone = [1, 1, 1, 0, 0, 0, 0, 0];

	var fracMiner = [25, 25, 50, 0, 0, 0, 0, 0];
	var maxMiner = [4, 4, 6, 0, 0, 0, 0, 0];
	var maxMiner = [1, 1, 1, 0, 0, 0, 0, 0];

	var fracClaimer = [25, 25, 50, 0, 0, 0, 0, 0];
	var maxClaimer = [2, 0, 0, 2, 0, 0, 0, 0];
	var minClaimer = [1, 0, 0, 1, 0, 0, 0, 0];

	var fracSlave = [25, 0, 75, 0, 0, 0, 0, 0];
	var maxSlave = [1, 1, 8, 0, 0, 0, 0, 0];
	var minSlave = [1, 1, 1, 0, 0, 0, 0, 0];

	var fracGuard = [40, 0, 0, 0, 40, 20, 0, 0];
	var maxGuard = [100, 0, 0, 0, 100, 100, 0, 0];
	var minGuard = [1, 0, 0, 0, 1, 1, 0, 0];

	var fracHealer = [40, 0, 0, 0, 20, 0, 0, 40];
	var maxHealer = [100, 0, 0, 0, 100, 0, 0, 100];
	var maxHealer = [1, 0, 0, 0, 1, 0, 0, 1];

//Loading fractions, max and min into function
	switch (type) {
	case "Drone": {
		partControl = {
			(frac: fracDrone, most: maxDrone, least: minDrone)
		};
	break; }
	
	case "Miner": {
		partControl = {
			(frac: fracMiner, most: maxMiner, least: minMiner)
		};
	break; }
	
	case "Claimer": {
		partControl = {
			(frac: fracClaimer, most: maxClaimer, least: minClaimer)
		};
	break; }
	
	case "Slave": {
		partControl = {
			(frac: fracSlave, most: maxSlave, least: minSlave)
		};
	break; }
	
	case "Guard": {
		partControl = {
			(frac: fracGuard, most: maxGuard, least: minGuard)
		};
	break; }
	
	case "Healer": {
		partControl = {
			(frac: fracHealer, most: maxHealer, least: minHealer)
		};
	break; }
	
	default: {
		console.log('Invalid creep type');
	break; }
	}

	var bestParts = [0, 0, 0, 0, 0, 0, 0, 0];
	var energyLeft = cap;
	var buildCost = 0;
	var fatigue = 0;
	var build = true;

	for (let i in bestParts) {

		bestParts[i] = Math.floor(cap * partControl.frac[i] / partCost[i]);
		bestParts[i] = min(bestParts[i], partControl.most[i]);

		energyLeft -= (bestParts[i] * partCost[i]);
		fatigue += (bestParts[i] * partWeightPlains[i])
	}
	for (let i in bestParts) {
		//Will add parts in order...
		if (bestParts[i] < partControl.most[i] && energyLeft > partCost[i]) {
			bestParts[i]++;
			energyLeft -= (partCost[i]);
		}
		buildCost += (bestParts[i] * partCost[i])
		if (energyLeft < 0) {

			console.log('Error in the parts logic')
			build = false;
		}
		if ((bestParts[i] < partControl.least[i]) {
			console.log('Not enough energy to build ' + type)
			build = false;
		}
	}
	buildResults = {
		(body: makeParts(bestParts), cost: buildCost, fatigue: fatigue, build: build)
	}
	return  = buildResults;

	//Debugging
	//makeBestBody(300,'Drone')
	//console.log(buildResults.body)
	//console.log(buildResults.cost)
	//console.log(buildResults.fatigue)
	//console.log(buildResults.build)

}

function makeParts(bestParts) {
	var list = [];
	var i = 0;
	for (i = 0; i < bestParts[0]; i++) {
		list.push(MOVE);
	}
	for (i = 0; i < bestParts[1]; i++) {
		list.push(CARRY);
	}
	for (i = 0; i < bestParts[2]; i++) {
		list.push(WORK);
	}
	for (i = 0; i < bestParts[3]; i++) {
		list.push(CLAIM);
	}
	for (i = 0; i < bestParts[4]; i++) {
		list.push(TOUGH);
	}
	for (i = 0; i < bestParts[5]; i++) {
		list.push(ATTACK);
	}
	for (i = 0; i < bestParts[6]; i++) {
		list.push(RANGED_ATTACK);
	}
	for (i = 0; i < bestParts[7]; i++) {
		list.push(HEAL);
	}
	return list;
}

makeCreep: function (spawn, type) {
	if
	var creepName = type + Game.time + "@" + spawn.room.name + "-" + spawn.room.memory.scoutRoom;
spawn.createCreep(makeParts(5, 4, 4, 1), creepName, {
	role: 'scout',
	scoutRoom: spawn.room.memory.scoutRoom
});
