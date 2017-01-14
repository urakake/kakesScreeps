/** ------------------------------------------------------ role.room -----------------------------------------------------
 * @param {Creep} creep 
 * by Urakake     **/
		
var roleRoom = {
    run: function(myRoom) {
        if (!myRoom.memory.init){   
            initRoom(myRoom);
        }
		clearCounts(myRoom);
		workTowers(myRoom);
	}
};
function checkArrays(myRoom){
    //check boxes, miners and movers
    var brokenArrays;
    for(var i in myRoom.memory.minerNames){
        var miner=Game.creeps[myRoom.memory.minerNames[i]];
        if(miner==undefined){
            myRoom.memory.minerNames[i]="";
        }
    }
    for(var i in myRoom.memory.moverNames){
        var mover=Game.creeps[myRoom.memory.moverNames[i]];
        if(mover==undefined){
            myRoom.memory.moverNames[i]="";
        }
    }
    for(var i in myRoom.memory.sourceBins){
        var bin = Game.getObjectById(myRoom.memory.sourceBins[i])
        if(bin==undefined){
            myRoom.memory.sourceBins[i]="";
        }
    }
    for(var i in myRoom.memory.destBins){
        var bin = Game.getObjectById(myRoom.memory.destBins[i])
        if(bin==undefined){
            myRoom.memory.destBins[i]="";
        }
    }
}
function workTowers(myRoom) {
	var targets = myRoom.find(FIND_MY_STRUCTURES, {
			filter: (structure) => {
				return (structure.structureType == STRUCTURE_TOWER)
			}
	});
	for (var i in targets) {
		var tower = targets[i];
		if(tower) {
		    var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            if(closestHostile) {
                tower.attack(closestHostile);
            } else if (tower.energy>tower.energyCapacity*.7) {
                
               var damagedStructures = tower.room.find(FIND_STRUCTURES, {
						filter: (structure) => {
							return ((structure.hits < structure.hitsMax) && (structure.hits < 250000))
						}
					});
				if (damagedStructures) {
					var lowHP = 100000000000;
					var lowID = null;
					for (var j in damagedStructures) {
						if (damagedStructures[j].hits < lowHP) {
						    if(tower.pos.inRangeTo(damagedStructures[j], 20)){
						        lowID = damagedStructures[j]
							    lowHP = damagedStructures[j].hits
						    }
						}
					}
					if (lowID != null ) {
						tower.repair(lowID);
					}
				}
            }
		}
	}
}
function clearCounts(myRoom){
    myRoom.memory.numClaimers=0;
    myRoom.memory.numDrones=0;
    myRoom.memory.numGuards=0;
    myRoom.memory.numMiners=0;
    myRoom.memory.numMovers=0;
    myRoom.memory.numScouts=0;
    myRoom.memory.numSlaves=0;
    myRoom.memory.numClaimers=0;
    myRoom.memory.sourceIter=0;
}
function initRoom(myRoom) {
    console.log("Initializing Room ("+myRoom.name+")");
    myRoom.memory.init=true;
	myRoom.memory.sourceBins=[];
	myRoom.memory.minerNames=[];
	myRoom.memory.destBins=[];
	myRoom.memory.moverNames=[];
	var sources = myRoom.find(FIND_SOURCES);
	var sourceIds=[];
	var minerNames=[];
	for (var j in sources){
	    sourceIds.push(sources[j].id);
	    minerNames.push("");
	}
	myRoom.memory.sourceIds = sourceIds;
	myRoom.memory.minerNames = minerNames;
	clearCounts(myRoom);
	checkRoom(myRoom)
	0
}
module.exports = roleRoom;
//------------------------------------------------------ role.room -----------------------------------------------------



