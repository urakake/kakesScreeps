/** ----------------------------------------------------------- role.slave -------------------------------------------------------------------
 * @param {Creep} creep 
 * by Urakake     **/
		
var roleSlave = {
     run: function(creep) {
        if(!creep.memory.init){
            init(creep);
        }
        work(creep);
	}, 
	makeSlave: function(spawn){
	    var cap = spawn.room.energyAvailable;
        var creepName="controllerSlave"+Game.time+"@"+spawn.room.name+"@"+spawn.name;
        console.log("Creating Creep ("+creepName+")");
        return spawn.createCreep( makeBestBody(cap), creepName, { role: 'slave' } );
	},
	checkSlaves: function(myRoom){
	    var foundMissing=false;
	    if(myRoom.memory.numSlaves<1){
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
	    }
	    return foundMissing;
	}
};

function work(creep) {
	if(creep.memory.state == "acquireEnergy"){
		acquireEnergy(creep);
	} else if(creep.memory.state == "dumpEnergy"){
	    dumpEnergy(creep);
	} 
}
function acquireEnergy(creep) {
    if(creep.memory.storeBox==undefined){
        harvestAssignedNode(creep)
    } else {
        pickupFromBin(creep)
    }
    if(creep.carry.energy==creep.carryCapacity){
        creep.memory.state = "dumpEnergy";
    }
}
function dumpEnergy(creep) {
    //if(creep.room.controller.level!=8){
    if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
        creep.moveTo(creep.room.controller);
    }
    if(creep.carry.energy==0){
        creep.memory.state = "acquireEnergy";
    }
}
function harvestAssignedNode(creep) {
	if(creep.carry.energy < creep.carryCapacity) {   // not full energy
	    var targetSource = Game.getObjectById(creep.memory.assignedNode);
	    if (targetSource!=null){
	        if(targetSource.energy != 0 && creep.harvest(targetSource) == ERR_NOT_IN_RANGE){
    			creep.moveTo(targetSource);
    		} else if (targetSource.energy == 0){ 

    		}
	    } else {
	        var sources = creep.room.find(FIND_SOURCES);
        	creep.memory.assignedNode=sources[creep.room.memory.sourceIter].id;
        	creep.room.memory.sourceIter+=1;
        	if (creep.room.memory.sourceIter==creep.room.memory.sourceNum){
        		creep.room.memory.sourceIter=0;
        	}
	    }
	} else {                                // full energy
		creep.memory.state = "upgrade";
		creep.say('upgrade');
		//work(creep);
	}
}
function findStorage(creep){
    var foundStorage=false;
    var targets = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                 return (structure.structureType == STRUCTURE_STORAGE || structure.structureType == STRUCTURE_LINK || structure.structureType == STRUCTURE_CONTAINER)
            }
    });
    if (targets.length>0){
        var closestBox=creep.room.controller.pos.findClosestByRange(targets);
        if (creep.room.controller.pos.inRangeTo(closestBox, 8)){
            creep.memory.storeBox=closestBox.id;
            foundStorage=true;
            //creep.memory.state = "acquireEnergy";
            var storageSaved=false;
            for (var i in creep.room.memory.destBins){
                if(creep.room.memory.destBins[i]==creep.memory.storeBox){
                    storageSaved=true
                }
            }
            if(!storageSaved){
                creep.room.memory.destBins.push(closestBox.id);
            }
        }
    }
    return foundStorage;
}
function pickupFromBin(creep){
    var target=Game.getObjectById(creep.memory.storeBox);
    //console.log(target)
    if(target.transfer(creep, RESOURCE_ENERGY) < 0) {
        creep.moveTo(target);
    }
}
function makeBestBody(cap){
    var body = [];
    if(cap<300){   // under 300
        body =  makeParts(1,1,1);
    } else if(cap<550){   // 300-549
        body =  makeParts(1,1,2);
    } else if(cap<800){   // 550-799
        body =  makeParts(2,1,4);
    } else if(cap<1300){   // 800-1299
        body =  makeParts(1,1,7);
    } else if(cap<1800){   // 1300-1799
        body = makeParts(4,2,10);
    } else if(cap<2300){   // 1800-2299
        body = makeParts(4,4,10);
    } else {   // 2300+
        body = makeParts(4,4,15);
    }
    return body;
}
function makeParts(moves, carries, works) {
    var list = [];
    for(var i=0;i<moves;i++){
        list.push(MOVE);
    }
    for(var i=0;i<carries;i++){
        list.push(CARRY);
    }
    for(var i=0;i<works;i++){
        list.push(WORK);
    }
    return list;
}
function init(creep) {
    console.log("Initializing Slave - "+creep.name);
    creep.memory.init=true;
    creep.memory.role="slave";
    creep.memory.state="acquireEnergy";
	if(creep.memory.assignedNode==undefined){               // no assigned node, pick next node
	    var sources = creep.room.find(FIND_SOURCES);
    	creep.memory.assignedNode=sources[creep.room.memory.sourceIter].id;
    	creep.room.memory.sourceIter+=1;
    	if (creep.room.memory.sourceIter==creep.room.memory.sourceNum){
    		creep.room.memory.sourceIter=0;
    	}
	}
	findStorage(creep);
}

module.exports = roleSlave;
// ----------------------------------------------------------- role.slave -------------------------------------------------------------------



