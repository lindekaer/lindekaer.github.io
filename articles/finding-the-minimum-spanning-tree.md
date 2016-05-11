Spanning trees are most commonly used in the domain of pathfinding. The famous algorithms of *Dijkstra* and *A** both make use of spanning trees. 

## Definition
Given a graph <span class="focus one">G</span>, a spanning tree is defined as a subgraph of <span class="focus one">G</span> that includes all vertices of <span class="focus one">G</span>. If <span class="focus one">G</span> is disconnected graph, it is impossible to find a spanning tree. If all the edges of <span class="focus one">G</span> are included in the subgraph <span class="focus two">T</span>, then <span class="focus one">G</span> and <span class="focus two">T</span> are identical.

A graph can have many different spanning trees, but only one minimum spanning tree (MST). The MST is defined is being the spanning tree with the *lowest cost* (accumulated weight of edges).

## Implementation
I will make use of Kruskal's algorithm to find the minimum spanning tree. The method declarations for the implementation can be seen below.

```javascript
/**
 * Finds the minimum spanning tree of a connected graph
 * @param  {array} vertices [array of vertices of the graph]
 * @param  {array} edges    [array of vertex pairs and edge cost]
 * @return {array}          [minimum spanning tree array]
 */
function findMST(vertices, edges) {}

/**
 * Finds the disjoint set in which a given node belongs
 * @param  {string} vertex   [identifier for vertex to be found]
 * @param  {array} vertices  [array of disjoint sets of vertices]
 */
function find(vertex, vertices) {}

/**
 * Unites two disjoint sets
 * @param  {arr} arr1 [disjoint set]
 * @param  {arr} arr2 [disjoint set]
 * @return {arr}      [united disjoint set]
 */
function union(arr1, arr2) {}
```

## Problem scenario
Imagine you are trying to plan a European tour. You want to visit Madrid, Paris, Rome, Bucharest and Berlin. There are many flights connecting the different cities and you want to find the cheapest path. A path that visits all the cities with the lowest total cost is an MST.

<div id="map1" data-lat="47.9749327" data-lng="11.0781581" data-zoom="4" data-type="pencil">
  <div data-lat="48.856614" data-lng="2.352222" data-label="Paris"></div>
  <div data-lat="41.902783" data-lng="12.496366" data-label="Rome"></div>
  <div data-lat="52.520007" data-lng="13.404954" data-label="Berlin"></div>
  <div data-lat="40.416775" data-lng="-3.703790" data-label="Madrid"></div>
  <div data-lat="44.426767" data-lng="26.102538" data-label="Bucharest"></div>
</div>

```javascript
var vertices = [
  'Paris',
  'Rome',
  'Berlin',
  'Madrid',
  'Bucharest'
];

// Interpreted as [origin, destination, price]
var edges = [
  ['Paris', 'Rome', 125],
  ['Paris', 'Berlin', 70],
  ['Paris', 'Madrid', 90],
  ['Paris', 'Bucharest', 100],
  ['Rome', 'Madrid', 120],
  ['Berlin', 'Bucharest', 55],
  ['Berlin', 'Madrid', 110],
  ['Madrid', 'Bucharest', 85],
  ['Bucharest', 'Rome', 110]
];
```

## Sources
- [Wikipedia - Minimum spanning tree](https://en.wikipedia.org/wiki/Minimum_spanning_tree)
- [Github - Kruskal's algorithm](https://gist.github.com/n8agrin/3629426)
- [Youtube - Minimum spanning tree](https://www.youtube.com/watch?v=5xosHRdxqHA)
