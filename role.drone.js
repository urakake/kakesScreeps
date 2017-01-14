/** ------------------------------------------------------ role.drone -----------------------------------------------------
 * @param {Creep} creep 
 * by Urakake     **/
		
var roleDrone = {
    run: function(creep) {
        if(!creep.memory.init){
            init(creep);
        }
        work(creep);
	},
	makeDrone: function(spawn){
	    var cap = spawn.room.energyAvailable;
	    var creepName="drone"+Game.time+"@"+spawn.room.name+"@"+spawn.name;
	    console.log("Creating Creep ("+creepName+")");
	    spawn.createCreep( makeBestBody(cap), creepName, { role: 'drone' } );
	},
	checkDrones: function(myRoom){
	    var foundMissing=false;
        var targets = myRoom.find(FIND_CONSTRUCTION_SITES);
        if (targets.length<2){
            if (myRoom.memory.numDrones<1){
                var foundMissing=true;
            }
        } else if (targets.length<6){
            if (myRoom.memory.numDrones<1){
                var foundMissing=true;
            }
        } else {
            if (myRoom.memory.numDrones<2){
                var foundMissing=true;
            }
        }
        return foundMissing;
	}
};

function work(creep) {
    switch(creep.memory.state) {
        case "acquire":
            acquireEnergy(creep);
            break;
        case "pickup":
            pickupEnergy(creep);
            break;
        case "getFromBin":
            getFromBin(creep);
            break;
        case "harvest":
            harvestNode(creep);
            break;
        case "dump":
            dumpEnergy(creep);
            break;
        case "store":
            storeForSpawn(creep);
            break;
        case "build":
            buildConstructionSite(creep);
            break;
        case "repair":
            repairDamagedStructure(creep);
            break;
        case "upgrade":
            dumpInController(creep);
            break;
        default:
            //creep.memory.state="dump"
    }
}
function acquireEnergy(creep) {
    creep.memory.target=undefined;
    var target = undefined
    var targets = creep.room.find(FIND_DROPPED_ENERGY);
    if(targets.length>0)
        target = creep.pos.findClosestByRange(targets);
    if(target!=undefined && target.amount>50){                   // found dropped energy
        creep.memory.target=target.id;
        creep.memory.state = "pickup";
        creep.say("pickup");
    } else {
        var targets = [];
        target=undefined;
        for(var i in creep.room.memory.sourceBins){
            var bin = Game.getObjectById(creep.room.memory.sourceBins[i]);
            //console.log(containerEmpty(bin))
            if(bin!=undefined && !containerEmpty(bin)){
                targets.push(bin);
            }
        }
        if(targets.length>0)
            target = creep.pos.findClosestByRange(targets);
        if(target!=undefined){    // found source bin
            creep.memory.target=target.id;
            //console.log(target.id)
            creep.memory.state = "getFromBin";
            creep.say("fill");
        } else {
            var targets = creep.room.find(FIND_SOURCES,{
                filter: function(object) {
                    return object.energy>0;
                }
            });
            if(targets.length>0)
                target = creep.pos.findClosestByRange(targets);
            if(target!=undefined){                              // found source Node
                creep.memory.target=target.id;
                creep.memory.state = "harvest";
                creep.say("harvest");
            } else {
                if((creep.carry.energy*2)<creep.carryCapacity){
                    creep.memory.state = "acquire";
                } else {
                    creep.memory.state = "dump";
                }
                creep.say("no energy");
            }
        }
    }
    if(creep.memory.state!="dump" && creep.memory.state!="acquire"){
       //work(creep);
    }
}
function pickupEnergy(creep) {
    var target = Game.getObjectById(creep.memory.target);
    var validSource=false;
    if(target!=undefined && target.amount>15){
        if(creep.pickup(target) == ERR_NOT_IN_RANGE){
        	creep.moveTo(target);
        	validSource=true;
        }
    }
    if(creep.carry.energy==creep.carryCapacity){
        creep.memory.state = "dump";
    } else {
        if(!validSource){
            if((creep.carry.energy*2)<creep.carryCapacity){
                creep.memory.state = "acquire";
            } else {
                creep.memory.state = "dump";
            }
        }
    }
}
function getFromBin(creep) {
    var target = Game.getObjectById(creep.memory.target);
    var validSource=false;
    if(target!=undefined && (target.structureType==STRUCTURE_CONTAINER || target.structureType==STRUCTURE_STORAGE || target.structureType==STRUCTURE_LINK ) && target.store[RESOURCE_ENERGY]!=0){
        if(target.transfer(creep,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
        	creep.moveTo(target);
        	validSource=true;
        }
    }
    if(creep.carry.energy==creep.carryCapacity){
        creep.memory.state = "dump";
    } else {
        if(!validSource){
            if((creep.carry.energy*2)<creep.carryCapacity){
                creep.memory.state = "acquire";
            } else {
                creep.memory.state = "dump";
            }
        }
    }
}
function harvestNode(creep) {
    var target = Game.getObjectById(creep.memory.target);
    var validSource=false;
    if(target!=undefined && target.energy>0){
        if(creep.harvest(target) == ERR_NOT_IN_RANGE){
        	if(creep.moveTo(target) == ERR_NO_PATH){
        	    for(var i in creep.room.memory.sourceIds){
        	        if(target.id != creep.room.memory.sourceIds[i]){
        	            creep.memory.target=creep.room.memory.sourceIds[i]
        	        }
        	    }
        	}
        	validSource=true;
        } else {
            validSource=true;
        }
    }
    if(creep.carry.energy==creep.carryCapacity){
        creep.memory.state = "dump";
    } else {
        if(!validSource){
            if((creep.carry.energy*2)<creep.carryCapacity){
                creep.memory.state = "acquire";
            } else {
                creep.memory.state = "dump";
            }
        }
    }
}
function dumpEnergy(creep) {                                                            
    creep.memory.target=undefined;
    var target = undefined
    if (creep.room.controller.ticksToDowngrade<800){                                        //  1 contoller downgrade?
        creep.memory.state = "upgrade";
        creep.say('upgrade');
    } 
    if (creep.memory.state=="dump") {
        var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                     return ((structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) && (structure.energy < structure.energyCapacity) ||
                        (structure.structureType == STRUCTURE_TOWER) && (structure.energy < structure.energyCapacity*.8))
                }
        });
        if(targets.length>0) {                                                              //  2 extenstion filled?
                creep.memory.target=creep.pos.findClosestByRange(targets).id;
    			creep.memory.state = "store";
    			creep.say('store');
    	} else {
		    var targets = creep.room.find(FIND_STRUCTURES, {
    			filter: (structure) => {   return ((structure.hits < structure.hitsMax) && (structure.hits < 2500))	}
    		});
        	if (targets.length>0) {                                                         //   3 building low?
        	    creep.memory.target=creep.pos.findClosestByRange(targets).id;
        		creep.memory.state = "repair";
			    creep.say('repair');
        	} else {
        	    var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
        		if(targets.length>0) {                                                      //  4 building sites?
        		    creep.memory.target=creep.pos.findClosestByRange(targets).id;
        			creep.memory.state = "build";
        			creep.say('build');
        		} else {
        		    var targets = creep.room.find(FIND_STRUCTURES, {
            			filter: (structure) => {   return ((structure.hits < structure.hitsMax) && (structure.hits < 250000))	}
            		});
                	if (targets.length>0) {                                                 //   5 building kina low?
                	    creep.memory.target=creep.pos.findClosestByRange(targets).id;
                		creep.memory.state = "repair";
        			    creep.say('repair');
                	} else {
                	    creep.memory.state = "upgrade";                                     //   6 dump into controller          
            	        creep.say('upgrade');
                	}
        		}
    		}
    	}
    }
    if(creep.memory.state!="dump" && creep.memory.state!="acquire"){
        //work(creep);
    }
}
function storeForSpawn(creep) {
    var target = Game.getObjectById(creep.memory.target);
    var validSource=false;
    if(target!=undefined){
        if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
            validSource=true;
        }
    }
    if(creep.carry.energy==0){
        creep.memory.state = "acquire"
    } else {
        if(!validSource){
            if((creep.carry.energy*2)<creep.carryCapacity){
                creep.memory.state = "acquire";
            } else {
                creep.memory.state = "dump";
            }
        }
    }
}
function buildConstructionSite(creep){
    var target = Game.getObjectById(creep.memory.target);
    var validSource=false;
    if(target!=undefined && target!=null && target.progress!=target.progressTotal){
        if(creep.build(target) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
            validSource=true;
        } else {
            validSource=true;
        }
    }
    if(creep.carry.energy==0){
        creep.memory.state = "acquire"
    } else {
        if(!validSource){
            if((creep.carry.energy*2)<creep.carryCapacity){
                creep.memory.state = "acquire";
            } else {
                creep.memory.state = "dump";
            }
        }
    }
}
function repairDamagedStructure(creep){
    var target = Game.getObjectById(creep.memory.target);
    var validSource=false;
    if(target!=undefined && (target.hits<target.hitsMax) && target.hits<250000){
       // console.log(creep.repair(target))
        if(creep.repair(target) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
            validSource=true;
        } else {
            validSource=true;
        }
    }
    if(creep.carry.energy==0){
        creep.memory.state = "acquire"
    } else {
        if(!validSource){
            if((creep.carry.energy*2)<creep.carryCapacity){
                creep.memory.state = "acquire";
            } else {
                creep.memory.state = "dump";
            }
        }
    }
}
function dumpInController(creep) {
    if(creep.room.controller.my){
        if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
            creep.moveTo(creep.room.controller);
        }
    } else {
        //console.log(creep.body.indexOf(CLAIM))
        var hasClaim=false;
        for(var i in creep.body){
            var part = creep.body[i].type;
            if(part==CLAIM){
                hasClaim=true;
                
            }
        }
        if(hasClaim){
            if(creep.room.memory.capture==true){
                if(creep.claimController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.controller);
                }
            } else {
                if(creep.reserveController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.controller);
                }
            }
        } else {
            creep.say("bored")
        }
    }
    if(creep.carry.energy==0)    
        creep.memory.state = "acquire";
}
function containerEmpty(structure){
    var empty;
    if(structure==null){
        empty=true;
    } else if(structure.structureType==STRUCTURE_EXTENSION || structure.structureType==STRUCTURE_SPAWN || structure.structureType==STRUCTURE_TOWER || structure.structureType==STRUCTURE_LINK){
        if (structure.energy==0){
            empty=true;
        } else {
            empty=false;
        }
    } else if (structure.structureType==STRUCTURE_CONTAINER || structure.structureType==STRUCTURE_STORAGE){
         if (structure.store[RESOURCE_ENERGY]==0){
            empty=true;
        } else {
            empty=false;
        }
    } 
    return empty;
}
function makeBestBody(cap){
    var body = [];
    if(cap<300){   // under 300
        body = makeParts(1,1,1)
    } else if(cap<400){   // 300-399
        body = makeParts(2,2,1)
    } else if(cap<550){   // 400-549
        body = makeParts(2,2,2)
    } else if(cap<800){   // 550-799
        body = makeParts(3,4,2)
    } else if(cap<1300){   // 800-1299
        body = makeParts(4,5,3)
    } else if(cap<1800){   // 1300-1799
        body = makeParts(6,6,6)
    } else if(cap<2300){   // 1800-2299
        body = makeParts(7,8,6)
    } else {   // 2300+
        body = makeParts(7,8,6)
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
    console.log("Initializing Drone - "+creep.name);
    creep.memory.init=true;
    creep.memory.role="drone";
    creep.memory.state="acquire";
    if(creep.memory.spawnRoom == undefined)
        creep.memory.spawnRoom = creep.room.name;
    creep.memory.target=undefined
}
module.exports = roleDrone;
//------------------------------------------------------ role.drone -----------------------------------------------------



