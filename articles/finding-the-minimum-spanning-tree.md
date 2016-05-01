Spanning trees are most commonly used in the domain of pathfinding. The famous algorithms of *Dijkstra* and *A** both make use of spanning trees. 

## Definition
Given a graph <span class="focus one">G</span>, a spanning tree is defined as a subgraph of <span class="focus one">G</span> that includes all vertices of <span class="focus one">G</span>. If G is disconnected graph, it is impossible to find a spanning tree. If all the edges of <span class="focus one">G</span> are included in the subgraph <span class="focus two">T</span>, then <span class="focus one">G</span> and <span class="focus two">T</span> are identical.

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

## Sources
- [Wikipedia - Minimum spanning tree](https://en.wikipedia.org/wiki/Minimum_spanning_tree)
- [Github - Kruskal's algorithm](https://gist.github.com/n8agrin/3629426)
- [Youtube - Minimum spanning tree](https://www.youtube.com/watch?v=5xosHRdxqHA)
