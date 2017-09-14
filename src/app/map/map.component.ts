import { ComponentFixture } from '@angular/core/testing';
import { Component, OnInit, OnDestroy, DoCheck, KeyValueDiffers, ViewChild } from '@angular/core';
import { Platform } from '../platform';
import { Character } from '../character';
import { CharacterService } from '../character.service';
import { Network, NodeOptions, DataSet, Node, Edge, IdType } from 'vis';
import { UniverseService } from '../universe.service';
import { Router } from '@angular/router';
import { System } from '../system';
import { Message } from '../message';

import { Observable } from 'rxjs/Rx';

import { MdSidenav, MdSnackBar } from '@angular/material';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  providers: [UniverseService]
})
export class MapComponent implements OnInit, OnDestroy, DoCheck {

  @ViewChild('sidenav') public myNav: MdSidenav;

  character: Character;
  selected: {
    name: string;
    status: boolean;
  };
  differ: any;
  universeData: any;
  region: any;
  systems: any;
  nodes: any;
  edges: any;
  nodeOpttions: {
    default: any,
    active: any
  };

  visNetwork: Network;
  visNetworkData: any;
  visNetworkOptions: any;

  constructor(
    public user: CharacterService,
    private router: Router,
    private universe: UniverseService,
    private differs: KeyValueDiffers,
    public snackBar: MdSnackBar
  ) {
    this.differ = {};
  }


  ngOnInit() {
    this.selected = { status: false, name: '' };
    this.user.getCharacterData();
    this.character = this.user.data;
    if (!this.character) {
      this.router.navigate(['/settings']);
    } else {
      this.character.watch();

      this.nodeOpttions = {
        default: {
          shape: 'dot',
          size: 30,
          borderWidth: 2,
          font: {
            size: 30,
            color: '#424242'
          },
          color: {
            border: '#424242',
            background: 'black',
            highlight: {
              border: '#d3d3d3',
              background: 'black',
            },
            hover: {
              border: '#424242',
              background: 'black'
            }
          }
        },
        active: {
          shape: 'circularImage',
          size: 50,
          image: this.character.portrait,
          brokenImage: './assets/default_avatar.jpg',
          font: {
            color: '#d3d3d3'
          }

        }
      };

      this.universe.getUniverse()
        .then(data => {
          this.universeData = data;
          this.systems = data.systems;
          this.region = this.getCurrentRegion();
        })
        .then(data => this.makeNetwork());

      this.differ['system'] = this.differs.find(this.character.system).create(null);
      this.differ['intel'] = this.differs.find(this.character.intel).create(null);
      this.differ['character'] = this.differs.find(this.character).create(null);

      Observable.timer(2000, 60000).subscribe(t => this.updateNodeColors());
      if (this.character.platform.name === 'win32') {
        Observable.timer(2000, 1000).subscribe(t => this.character.checkFiles());
      }
    }
  }

  ngOnDestroy() {
    if (this.visNetwork) {
      this.visNetwork.destroy();
    }
  }

  ngDoCheck() {
    if (this.character) {
      const systemChanged = this.differ['system'].diff(this.character.system);
      if (systemChanged) {
        systemChanged.forEachChangedItem(r => {
          if (r.key === 'name') {
            this.updateCurrentNode({ prev: r.previousValue, current: r.currentValue });
          }
        });
        systemChanged.forEachAddedItem(r => {
          if (r.key === 'name') {
            this.updateCurrentNode({ prev: '', current: r.currentValue });
          }
        });
      }

      const intelChanged = this.differ['intel'].diff(this.character.intel);
      if (intelChanged) {
        this.checkLatest();
        this.updateNodeColors();
      }

      const portraitChanged = this.differ['character'].diff(this.character);
      if (portraitChanged) {
        portraitChanged.forEachChangedItem(r => {
          if (r.key === 'portrait') {
            this.nodeOpttions.active.image = this.character.portrait;
          }
        });
      }
    }
  }

  updateNodeColors() {
    const _nodes = [];
    this.character.intel.forEach(message => {
      const _node = this.getNodeByName(message.system);
      if (_node) {
        const color = message.color;
        _nodes.push({
          id: _node.id,
          color: {
            background: color,
            hover: {
              background: color
            },
            highlight: {
              background: color
            }
          },
        });
      }
    });
    this.nodes.update(_nodes);
  }

  getCurrentRegion() {
    if (this.character.system.name) {
      this.character.system = new System(this.universeData.systems.find(s => s.name === this.character.system.name));
    } else {
      this.character.system = new System(this.universeData.systems.find(s => s.id === this.character.system.id));
    }
    return this.universeData.region[this.character.system.region];
  }

  getNodeByName(name: string) {
    const _tmp = this.region.systems.find(s => s.label === name);
    if (_tmp) {
      return this.nodes.get(_tmp.id);
    }
    // return this.region.systems.find(s => s.label === name)
  }

  getNodeById(id: number) {
    return this.region.systems.find(n => n.id === id);
  }

  checkLatest() {
    if (this.character.intel.length) {
      const last = this.character.intel[this.character.intel.length - 1];
      if (!last.clear) {
        const node = this.getNodeByName(last.system);
        if (node) {
          this.shortestPath(node.id);
        }
      }
    }
  }

  shortestPath(dest) {
    if (this.user.settings.voice.enable) {
      this.universe.getJumps(this.character.system.id, dest).then(data => {
        const jumps = data - 1;
        if (jumps < this.user.settings.voice.range) {
          this.sendAlert(jumps);
        }
      });
    }
  }

  sendAlert(jumps: number) {
    console.log('alert');
    const speech = speechSynthesis;
    let text = 'A hostile is in ';
    if (jumps === 0) {
      text += 'current system';
    } else {
      text += `${jumps} jump${jumps > 1 ? 's' : ''}`;
    }
    const message = new SpeechSynthesisUtterance(text);
    console.log(message);
    speech.speak(message);
  }

  updateCurrentNode(params: { prev: string, current: string }) {
    const _nodes = [];
    if (this.nodes) {
      const _current = this.region.systems.find(s => s.label === params.current);
      if (_current) {
        if (params.prev) {
          const _prev = this.region.systems.find(s => s.label === params.prev);
          delete _prev.image;
          Object.assign(_prev, this.nodeOpttions.default);
          _nodes.push(_prev);
        }
        Object.assign(_current, this.nodeOpttions.active);
        _nodes.push(_current);
        this.nodes.update(_nodes);
        this.character.system.id = _current.id;
        this.focusOn(this.character.system.id);
        this.updateNodeColors();
      } else {
        this.character.system.name = params.current;
        this.region = this.getCurrentRegion();
        this.makeNetwork();
      }
    }
  }

  focusOn(id?: number) {
    const _id = id || this.character.system.id;
    this.visNetwork.focus(_id, {
      scale: 1,
      animation: {
        duration: 1000,
        easingFunction: 'linear'
      }
    });
    this.visNetwork.selectNodes([_id]);
  }

  zoomOut() {
    this.visNetwork.fit({
      animation: {
        duration: 1000,
        easingFunction: 'linear'
      }
    });
  }

  showDetails(id: number) {
    this.selected.name = this.nodes.get(id).label;
    if (this.character.intel.find(message => message.system === this.selected.name)) {
      this.selected.status = true;
      this.myNav.open();
    } else {
      this.selected.status = false;
      this.snackBar.open(`No reports from ${this.selected.name}`, '', { duration: 2000 });
    }
  }

  makeNetwork() {
    this.region.systems.forEach(system => Object.assign(system, this.nodeOpttions.default));
    Object.assign(this.region.systems.find(s => s.id === this.character.system.id), this.nodeOpttions.active);
    this.nodes = new DataSet(this.region.systems);
    this.edges = new DataSet(this.region.edges);

    this.visNetworkData = {
      nodes: this.nodes,
      edges: this.edges
    };

    this.visNetworkOptions = {
      interaction: {
        dragNodes: false,
        hover: true,
        hoverConnectedEdges: false
      },
      nodes: this.nodeOpttions.default,
      edges: {
        color: {
          color: 'lightgray',
          hover: 'lightgray'
        },
        smooth: false,
      },
      layout: {
        randomSeed: 3
      },
      physics: {
        enabled: true,
        repulsion: {
          centralGravity: 0.2,
          springLength: 100,
          springConstant: 0.05,
          nodeDistance: 200,
          damping: 0.09
        },
        solver: 'repulsion'
      }
    };

    const container = document.getElementById('mynetwork');
    if (this.visNetwork) {
      this.visNetwork.destroy();
      this.visNetwork = new Network(container, this.visNetworkData, this.visNetworkOptions);
    } else {
      this.visNetwork = new Network(container, this.visNetworkData, this.visNetworkOptions);
    }

    this.visNetwork.once('afterDrawing', () => {
      this.focusOn(this.character.system.id);
    });

    // this.visNetwork.on('hoverNode', params => {
    //   console.log(params);
    // })


    this.visNetwork.on('click', params => {
      if (params.nodes.length) {
        this.showDetails(params.nodes[0]);
        // this.focusOn(_id)
      } else {
        this.zoomOut();
      }
    });

  }

}
