/** -------------------------------------------- role.slave ------------------------------------------
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
        var creepName="controllerSlave"+spawn.room.memory.creepIter+"@"+spawn.room.name;
        console.log("Creating Creep ("+creepName+")");
        spawn.room.memory.creepIter++
        if(cap<300){   // under 300
            spawn.createCreep( makeParts(1,1,1), creepName, { role: 'slave' } );
        } else if(cap<550){   // 300-549
            spawn.createCreep( makeParts(2,2,1), creepName, { role: 'slave' } );
        } else if(cap<800){   // 550-799
            spawn.createCreep( makeParts(2,4,2), creepName, { role: 'slave' } );
        } else if(cap<1300){   // 800-1299
            spawn.createCreep( makeParts(4,4,4), creepName, { role: 'slave' } );
        } else if(cap<1800){   // 1300-1799
            spawn.createCreep( makeParts(4,4,8), creepName, { role: 'slave' } );
        } else if(cap<2300){   // 1800-2299
            spawn.createCreep( makeParts(4,4,10), creepName, { role: 'slave' } );
        } else {   // 2300+
            spawn.createCreep( makeParts(4,4,10), creepName, { role: 'slave' } );
        }
	},
	checkSlaves: function(spawn){
	    var myRoom=spawn.room
	    var foundMissing=false;
	    if(myRoom.memory.numSlaves<2){
	        foundMissing=true;
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
    if(creep.memory.sourceBin==undefined){
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
function pickupFromBin(creep){
    var target=Game.getObjectById(creep.memory.sourceBin);
    //console.log(target)
    if(target.transfer(creep, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        creep.moveTo(target);
    }
}

function upgradeController(creep) {
    
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
	if(creep.memory.sourceBin==undefined){                  //no source bin... look for one
	    var targets = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                 return ((structure.structureType == STRUCTURE_STORAGE || structure.structureType == STRUCTURE_LINK || structure.structureType == STRUCTURE_CONTAINER))
            }
        });
        if (targets.length>0){
            var closestBox=creep.room.controller.pos.findClosestByRange(targets);
            if (creep.room.controller.pos.inRangeTo(closestBox, 8)){
                creep.memory.sourceBin=closestBox.id;
            }
        }
	}
}

module.exports = roleSlave;