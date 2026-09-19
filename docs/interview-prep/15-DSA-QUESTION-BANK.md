# Chapter 15 — DSA Question Bank (200+ problems by pattern)

> **The hard truth:** no amount of project fluency rescues a failed DSA round at most product companies. This is a gatekeeper. Treat it as a separate skill with its own practice discipline.
>
> **The method:** learn *patterns*, not problems. There are roughly 15 patterns that cover 90% of interview questions. Once you recognise the pattern, the problem becomes mechanical.

---

## 15.1 How to practise (read this before the problems)

### The four-pass method for any problem

1. **Restate and clarify (1 min).** Input constraints, output format, edge cases. *"Can the array be empty? Can values be negative? Is it sorted?"*
2. **Brute force out loud (2 min).** State it, state its complexity, and say you'll improve it. **Never skip this.** A brute force you can code beats an optimal solution you can't.
3. **Optimise by identifying the waste (3 min).** "I'm recomputing this sum" → prefix sums. "I'm re-scanning" → two pointers or sliding window. "I need the best-so-far" → heap. "I'm recomputing subproblems" → memoisation.
4. **Code, then trace one example by hand.** Tracing catches off-by-one errors before the interviewer does.

### Complexity you must know instantly

| Structure | Access | Search | Insert | Delete | Notes |
|---|---|---|---|---|---|
| Array | O(1) | O(n) | O(n) | O(n) | O(log n) search if sorted |
| Dynamic array | O(1) | O(n) | O(1)* | O(n) | *amortised at the end |
| Linked list | O(n) | O(n) | O(1) | O(1) | with a node reference |
| Hash table | — | O(1)* | O(1)* | O(1)* | *average; O(n) worst |
| BST (balanced) | O(log n) | O(log n) | O(log n) | O(log n) | |
| Heap | O(1) peek | O(n) | O(log n) | O(log n) | build from array O(n) |
| Trie | O(m) | O(m) | O(m) | O(m) | m = key length |
| Graph (adj list) | — | O(V+E) traverse | O(1) | O(E) | |

Sorting: comparison sorts are Ω(n log n). Merge sort O(n log n) stable, O(n) space. Quicksort O(n log n) average / O(n²) worst, O(log n) stack. Heapsort O(n log n), O(1) space, unstable. Counting/radix O(n+k) for bounded integers.

### The 60-day practice plan

| Weeks | Focus | Target |
|---|---|---|
| 1–2 | Arrays, strings, two pointers, sliding window, hashing | 40 problems |
| 3–4 | Linked lists, stacks, queues, binary search, sorting | 40 problems |
| 5–6 | Trees, BSTs, tries, heaps | 40 problems |
| 7–8 | Graphs (BFS/DFS/topological/union-find/shortest path) | 30 problems |
| 9 | Dynamic programming | 30 problems |
| 10+ | Mixed random practice under timer, contests | 20/week |

**Rule:** if you can't solve it in 30 minutes, read the solution, understand it, close it, and **re-solve it from scratch two days later**. Reading solutions without re-solving teaches you nothing.

---

## 15.2 Pattern 1 — Two Pointers

**When:** a sorted array, or pairs/triples, or comparing from both ends, or in-place rearrangement.

**Template:**
```
left = 0, right = n-1
while left < right:
    if condition(a[left], a[right]): return / record
    elif need_larger: left++
    else: right--
```

| # | Problem | Approach | Complexity |
|---|---|---|---|
| 1 | Two Sum II (sorted) | Converge from both ends | O(n) / O(1) |
| 2 | 3Sum | Sort, fix one, two-pointer the rest; skip duplicates | O(n²) / O(1) |
| 3 | 3Sum Closest | Same, track min diff | O(n²) |
| 4 | 4Sum | Two nested fixes + two pointers | O(n³) |
| 5 | Container With Most Water | Move the shorter wall inward | O(n) |
| 6 | Trapping Rain Water | Two pointers with running max on each side | O(n) / O(1) |
| 7 | Remove Duplicates from Sorted Array | Slow/fast write pointer | O(n) / O(1) |
| 8 | Move Zeroes | Slow/fast, swap non-zeros forward | O(n) / O(1) |
| 9 | Sort Colors (Dutch flag) | Three pointers: low, mid, high | O(n) / O(1) |
| 10 | Valid Palindrome | Skip non-alphanumeric, compare inward | O(n) |
| 11 | Valid Palindrome II | On mismatch, try skipping either side | O(n) |
| 12 | Merge Sorted Array (in place) | Fill from the back | O(m+n) / O(1) |
| 13 | Squares of a Sorted Array | Largest magnitude is at an end; fill from back | O(n) |
| 14 | Is Subsequence | Advance one pointer per match | O(n) |
| 15 | Reverse Words in a String | Reverse whole, then each word | O(n) |
| 16 | Partition Labels | Track last index of each char, extend window | O(n) |
| 17 | Boats to Save People | Sort, pair lightest with heaviest | O(n log n) |
| 18 | Longest Mountain in Array | Expand around peaks | O(n) |

**Key insight for 3Sum:** the duplicate-skipping is where most people fail. After finding a triple, advance `left` past all equal values and `right` past all equal values, and skip duplicate values for the fixed index too.

**Why Trapping Rain Water works with two pointers:** at any step, the side with the smaller max bounds the water level, so you can safely process that side and move inward. Being able to *state the invariant* is what gets you the point.

---

## 15.3 Pattern 2 — Sliding Window

**When:** contiguous subarray/substring with a constraint.

**Template (variable window):**
```
left = 0; best = 0
for right in range(n):
    add a[right] to window
    while window is invalid:
        remove a[left]; left++
    best = max(best, right - left + 1)
```

| # | Problem | Notes | Complexity |
|---|---|---|---|
| 19 | Maximum Subarray Sum of Size K | Fixed window | O(n) |
| 20 | Longest Substring Without Repeating Characters | Map char → last index | O(n) |
| 21 | Longest Repeating Character Replacement | Window valid if `len - maxFreq <= k` | O(n) |
| 22 | Minimum Window Substring | Two maps + a `have/need` counter | O(n) |
| 23 | Permutation in String | Fixed window + frequency match | O(n) |
| 24 | Find All Anagrams in a String | Same as above, collect all starts | O(n) |
| 25 | Fruit Into Baskets | Longest subarray with ≤2 distinct | O(n) |
| 26 | Longest Substring with At Most K Distinct | Map + shrink when size > k | O(n) |
| 27 | Max Consecutive Ones III | Window with at most k zeros | O(n) |
| 28 | Subarray Product Less Than K | Shrink while product ≥ k; count += window size | O(n) |
| 29 | Minimum Size Subarray Sum | Shrink while sum ≥ target | O(n) |
| 30 | Sliding Window Maximum | Monotonic deque of indices | O(n) |
| 31 | Count Number of Nice Subarrays | `atMost(k) - atMost(k-1)` | O(n) |
| 32 | Subarrays with K Different Integers | Same `atMost` trick | O(n) |

**The `atMost` trick is worth memorising:** "exactly K" = "at most K" − "at most K−1". It converts a hard exact-count problem into two easy sliding windows.

**Why Sliding Window Maximum needs a deque:** you need the max of the window in O(1) amortised. A deque holding indices in decreasing value order gives that — pop from the back while the new element is larger, pop from the front when it leaves the window.

---

## 15.4 Pattern 3 — Hashing / Frequency

| # | Problem | Notes |
|---|---|---|
| 33 | Two Sum | Map value → index; look for complement |
| 34 | Contains Duplicate | Set |
| 35 | Valid Anagram | Frequency map or sort |
| 36 | Group Anagrams | Key = sorted string or 26-count tuple |
| 37 | Top K Frequent Elements | Count + heap, or bucket sort by frequency → O(n) |
| 38 | Subarray Sum Equals K | Prefix sum + map of prefix counts |
| 39 | Continuous Subarray Sum | Prefix sum mod k + map of first index |
| 40 | Longest Consecutive Sequence | Set; only start counting at a number with no predecessor → O(n) |
| 41 | First Unique Character | Frequency map, second pass |
| 42 | Isomorphic Strings | Two maps, both directions |
| 43 | Word Pattern | Same, bijection check |
| 44 | Ransom Note | Frequency subtraction |
| 45 | Intersection of Two Arrays | Sets |
| 46 | Happy Number | Set for cycle detection, or Floyd |
| 47 | Longest Palindrome (build) | Count odds |
| 48 | 4Sum II | Map of pairwise sums from two arrays → O(n²) |
| 49 | Copy List with Random Pointer | Map old node → new node, or interleave |
| 50 | LRU Cache | Hash map + doubly linked list |
| 51 | LFU Cache | Map + frequency buckets of DLLs |
| 52 | Insert Delete GetRandom O(1) | Array + map value → index; swap-with-last on delete |

**Subarray Sum Equals K is the most important one here.** The insight: `sum(i..j) = prefix[j] - prefix[i-1]`, so for each `j` you want the count of prefixes equal to `prefix[j] - k`. One pass, one map. This prefix-sum-plus-map idea generalises to a dozen problems.

**LRU Cache is asked constantly.** Be able to write it: a hash map to nodes, a doubly linked list with sentinel head and tail, move-to-front on access, evict from the tail on overflow. **Connect it to your work:** *"This is the same structure as a Redis `allkeys-lru` policy, and I implemented a bounded cache with this shape in the scheduler."*

---

## 15.5 Pattern 4 — Binary Search

**When:** sorted data, or a monotonic predicate over a range (search on the *answer*).

**Template (find leftmost satisfying):**
```
lo, hi = 0, n            # or the answer range
while lo < hi:
    mid = lo + (hi - lo) // 2
    if predicate(mid): hi = mid
    else: lo = mid + 1
return lo
```

| # | Problem | Notes |
|---|---|---|
| 53 | Binary Search | The baseline |
| 54 | Search Insert Position | Leftmost ≥ target |
| 55 | First and Last Position in Sorted Array | Two binary searches |
| 56 | Search in Rotated Sorted Array | One half is always sorted; decide which |
| 57 | Find Minimum in Rotated Sorted Array | Compare mid to hi |
| 58 | Search a 2D Matrix | Treat as a flat sorted array |
| 59 | Search a 2D Matrix II | Start top-right, move left or down — O(m+n) |
| 60 | Find Peak Element | Move toward the larger neighbour |
| 61 | Median of Two Sorted Arrays | Partition binary search — O(log min(m,n)) |
| 62 | Koko Eating Bananas | **Binary search on the answer** |
| 63 | Capacity to Ship Packages in D Days | Binary search on capacity |
| 64 | Split Array Largest Sum | Binary search on the max subarray sum |
| 65 | Minimum Days to Make Bouquets | Binary search on days |
| 66 | Sqrt(x) | Binary search or Newton |
| 67 | Kth Smallest in a Sorted Matrix | Binary search on value + counting |
| 68 | Find K Closest Elements | Binary search the window start |
| 69 | Time Based Key-Value Store | Binary search on timestamps |
| 70 | Single Element in a Sorted Array | Binary search on index parity — O(log n) |

**"Binary search on the answer" is the highest-value idea in this section.** Whenever the question is "what's the minimum X such that something is achievable", and achievability is monotonic in X, binary search the answer space and write a `canDo(x)` feasibility check. Problems 62–65 are all the same problem.

**The `lo + (hi-lo)/2` idiom** avoids integer overflow in languages with fixed-width ints. Mention it in Java/Go/C++; it's a small correctness signal.

---

## 15.6 Pattern 5 — Linked Lists

| # | Problem | Notes |
|---|---|---|
| 71 | Reverse Linked List | Iterative three-pointer; also know recursive |
| 72 | Reverse Linked List II | Reverse a sublist in place |
| 73 | Reverse Nodes in k-Group | Count then reverse per group |
| 74 | Middle of the Linked List | Slow/fast |
| 75 | Linked List Cycle | Floyd's tortoise and hare |
| 76 | Linked List Cycle II | Find the entry: reset one pointer to head after meeting |
| 77 | Remove Nth Node From End | Fast pointer n ahead |
| 78 | Merge Two Sorted Lists | Dummy head |
| 79 | Merge K Sorted Lists | Min-heap, or divide and conquer — O(N log k) |
| 80 | Add Two Numbers | Carry propagation |
| 81 | Palindrome Linked List | Find middle, reverse half, compare — O(1) space |
| 82 | Intersection of Two Linked Lists | Switch heads on exhaustion |
| 83 | Remove Duplicates from Sorted List II | Dummy + prev pointer |
| 84 | Reorder List | Find middle, reverse second half, interleave |
| 85 | Rotate List | Make it circular, then break at the right point |
| 86 | Sort List | Merge sort on a list — O(n log n), O(log n) space |
| 87 | Flatten a Multilevel Doubly Linked List | DFS with a stack |
| 88 | LRU Cache | (repeat — it's a linked list problem too) |

**Why Floyd's cycle detection works:** the fast pointer gains one position per step, so if there's a cycle it must eventually land on the slow pointer. For finding the entry: the distance from head to the entry equals the distance from the meeting point to the entry, going forward. **Be able to prove it, not just state it** — that's a common follow-up.

**Always use a dummy head** when the head itself might be removed or changed. It eliminates an entire class of null-check special cases.

---

## 15.7 Pattern 6 — Stacks and Monotonic Stacks

| # | Problem | Notes |
|---|---|---|
| 89 | Valid Parentheses | Stack of expected closers |
| 90 | Min Stack | Second stack of minima, or store (val, min) pairs |
| 91 | Evaluate Reverse Polish Notation | Push operands, pop on operator |
| 92 | Basic Calculator I / II / III | Stack for signs and nesting |
| 93 | Daily Temperatures | **Monotonic decreasing stack** |
| 94 | Next Greater Element I / II | Monotonic stack; II wraps (iterate 2n) |
| 95 | Largest Rectangle in Histogram | Monotonic increasing stack of indices |
| 96 | Maximal Rectangle | Histogram per row |
| 97 | Trapping Rain Water | Also solvable with a monotonic stack |
| 98 | Remove K Digits | Monotonic increasing stack |
| 99 | Remove Duplicate Letters | Monotonic stack + last-occurrence map |
| 100 | Asteroid Collision | Stack simulation |
| 101 | Simplify Path | Stack of path segments |
| 102 | Decode String | Two stacks: counts and strings |
| 103 | Implement Queue using Stacks | Two stacks, amortised O(1) |
| 104 | Implement Stack using Queues | One queue, rotate on push |
| 105 | Online Stock Span | Monotonic stack of (price, span) |

**The monotonic stack signal:** any problem asking for "the next/previous greater/smaller element" is a monotonic stack, O(n). If you find yourself writing a nested loop scanning forward for a larger element, stop — that's the pattern.

**Largest Rectangle in Histogram is the hardest common stack problem.** The insight: for each bar, you want the first smaller bar to the left and to the right; the stack gives both in one pass. Practise it until it's automatic — it also unlocks Maximal Rectangle.

---

## 15.8 Pattern 7 — Trees

| # | Problem | Notes |
|---|---|---|
| 106 | Inorder / Preorder / Postorder Traversal | Recursive **and** iterative |
| 107 | Level Order Traversal | BFS with a queue, tracking level size |
| 108 | Zigzag Level Order | BFS + alternating reverse |
| 109 | Right Side View | BFS, take the last of each level |
| 110 | Maximum Depth | DFS |
| 111 | Minimum Depth | BFS (stop at first leaf) |
| 112 | Balanced Binary Tree | Bottom-up height with early exit |
| 113 | Diameter of Binary Tree | Max of (left+right) at each node |
| 114 | Same Tree / Symmetric Tree | Paired recursion |
| 115 | Subtree of Another Tree | Same-tree check at each node |
| 116 | Invert Binary Tree | Swap children recursively |
| 117 | Path Sum I / II / III | III uses prefix sums + map |
| 118 | Binary Tree Maximum Path Sum | Return best downward path, track global best |
| 119 | Lowest Common Ancestor (BT) | Return the node where both sides are non-null |
| 120 | LCA (BST) | Walk down comparing values |
| 121 | Validate BST | Pass down (min, max) bounds — **not** just comparing to the parent |
| 122 | Kth Smallest in BST | Inorder traversal with a counter |
| 123 | Construct Tree from Preorder + Inorder | Index map for O(1) root location |
| 124 | Serialize and Deserialize Binary Tree | Preorder with null markers |
| 125 | Flatten Binary Tree to Linked List | Reverse postorder, or Morris-style |
| 126 | Count Complete Tree Nodes | Compare left/right heights — O(log²n) |
| 127 | Populating Next Right Pointers | Use the established next pointers — O(1) space |
| 128 | Delete Node in a BST | Three cases; replace with inorder successor |
| 129 | Convert Sorted Array to BST | Middle as root, recurse |
| 130 | Binary Tree Cameras | Greedy post-order with three states |

**Validate BST is the classic trap.** Checking `node.left.val < node.val` locally is wrong — a value deep in the left subtree can exceed the root. You must carry bounds down.

**The general tree recursion template:**
```
def solve(node):
    if not node: return base_case
    left  = solve(node.left)
    right = solve(node.right)
    update_global_answer_using(left, right, node)
    return value_to_return_to_parent
```
The distinction between "what I return to my parent" and "what I use to update the global answer" is the key to Diameter and Maximum Path Sum. **Say that distinction out loud in the interview** — it's the thing being tested.

---

## 15.9 Pattern 8 — Heaps and Top-K

| # | Problem | Notes |
|---|---|---|
| 131 | Kth Largest Element in an Array | Min-heap of size k, or quickselect O(n) avg |
| 132 | Top K Frequent Elements | Count + heap, or bucket sort |
| 133 | K Closest Points to Origin | Max-heap of size k |
| 134 | Merge K Sorted Lists | Min-heap of heads |
| 135 | Find Median from Data Stream | **Two heaps** — max-heap of the low half, min-heap of the high half |
| 136 | Sliding Window Median | Two heaps + lazy deletion |
| 137 | Task Scheduler | Max-heap by frequency, or the math formula |
| 138 | Reorganize String | Max-heap, always take the two most frequent |
| 139 | Meeting Rooms II | Min-heap of end times |
| 140 | Kth Smallest in Sorted Matrix | Heap or binary search |
| 141 | Last Stone Weight | Max-heap |
| 142 | Minimum Cost to Connect Sticks | Min-heap, always combine two smallest |
| 143 | IPO / Maximize Capital | Two heaps |
| 144 | Smallest Range Covering K Lists | Min-heap across lists |

**Two-heap median is the one to master.** Invariant: the max-heap holds the smaller half, the min-heap the larger half, sizes differ by at most one. Push, then rebalance. It comes up constantly, and it's a real technique — a streaming percentile calculation in a monitoring system is the same structure.

**Quickselect** for Kth largest: partition like quicksort but recurse only into the side containing k. O(n) average, O(n²) worst (mitigated by random pivot). Know it as the "can you do better than the heap" answer.

---

## 15.10 Pattern 9 — Graphs

| # | Problem | Notes |
|---|---|---|
| 145 | Number of Islands | DFS/BFS flood fill |
| 146 | Max Area of Island | Same, track size |
| 147 | Rotting Oranges | **Multi-source BFS** |
| 148 | Walls and Gates | Multi-source BFS from gates |
| 149 | Surrounded Regions | DFS from borders, mark safe |
| 150 | Pacific Atlantic Water Flow | Two reverse BFS/DFS from each ocean |
| 151 | Clone Graph | DFS/BFS + map old→new |
| 152 | Course Schedule I / II | **Topological sort** — Kahn's or DFS with colours |
| 153 | Alien Dictionary | Build edges from adjacent word pairs, topo sort |
| 154 | Minimum Height Trees | Peel leaves layer by layer |
| 155 | Number of Connected Components | Union-Find or DFS |
| 156 | Redundant Connection | Union-Find; the edge that closes a cycle |
| 157 | Accounts Merge | Union-Find on emails |
| 158 | Graph Valid Tree | n−1 edges and connected |
| 159 | Network Delay Time | **Dijkstra** |
| 160 | Cheapest Flights Within K Stops | **Bellman-Ford** (k+1 relaxations) |
| 161 | Path with Maximum Probability | Dijkstra with a max-heap |
| 162 | Swim in Rising Water | Dijkstra / binary search + BFS |
| 163 | Word Ladder | BFS on an implicit graph |
| 164 | Open the Lock | BFS with a visited set |
| 165 | Min Cost to Connect All Points | **MST** — Prim's or Kruskal's |
| 166 | Reconstruct Itinerary | Hierholzer's (Eulerian path) |
| 167 | Critical Connections (bridges) | Tarjan's low-link |
| 168 | Shortest Path in Binary Matrix | BFS with 8 directions |
| 169 | Number of Provinces | Union-Find |
| 170 | Evaluate Division | Weighted graph DFS, or weighted Union-Find |

**Algorithm selection is what's being tested:**
- Unweighted shortest path → **BFS**
- Non-negative weights → **Dijkstra** (priority queue)
- Negative weights, or a hop limit → **Bellman-Ford**
- All-pairs, small graph → **Floyd-Warshall** O(V³)
- Dependencies/ordering → **Topological sort**
- Dynamic connectivity, cycle detection in undirected → **Union-Find**
- Minimum spanning tree → **Kruskal** (sort edges + Union-Find) or **Prim** (heap)

**Union-Find template with both optimisations:**
```python
parent = list(range(n)); rank = [0]*n
def find(x):
    while parent[x] != x:
        parent[x] = parent[parent[x]]   # path compression (halving)
        x = parent[x]
    return x
def union(a, b):
    ra, rb = find(a), find(b)
    if ra == rb: return False
    if rank[ra] < rank[rb]: ra, rb = rb, ra
    parent[rb] = ra
    if rank[ra] == rank[rb]: rank[ra] += 1
    return True
```
With both path compression and union by rank, operations are O(α(n)) — effectively constant. **Know that α is the inverse Ackermann function and that it's < 5 for any practical n.**

**Connect graphs to your own work:** your job scheduler's dependency feature (Chapter 12 Q118) is a DAG with topological ordering, and cycle detection prevents an unschedulable graph. That connection makes a DSA answer land as engineering rather than puzzle-solving.

---

## 15.11 Pattern 10 — Dynamic Programming

**The method:** (1) define the state — what does `dp[i]` mean, in words? (2) write the recurrence. (3) identify base cases. (4) decide the iteration order. (5) optimise space if the recurrence only looks back a constant number of steps.

**Say the state definition out loud.** *"`dp[i]` is the length of the longest increasing subsequence ending at index i."* Most DP failures are state-definition failures, not coding failures.

### 1-D DP

| # | Problem | State |
|---|---|---|
| 171 | Climbing Stairs | `dp[i]` = ways to reach step i |
| 172 | House Robber | `dp[i]` = max loot through house i |
| 173 | House Robber II | Circular: run twice, excluding first or last |
| 174 | Min Cost Climbing Stairs | `dp[i]` = min cost to reach i |
| 175 | Decode Ways | `dp[i]` = decodings of prefix of length i |
| 176 | Word Break | `dp[i]` = is prefix of length i segmentable |
| 177 | Coin Change | `dp[a]` = min coins for amount a |
| 178 | Coin Change II | `dp[a]` = number of combinations (loop coins outer) |
| 179 | Longest Increasing Subsequence | `dp[i]` = LIS ending at i; O(n log n) with patience sorting |
| 180 | Maximum Subarray (Kadane) | `dp[i]` = best sum ending at i |
| 181 | Maximum Product Subarray | Track both max and min (negatives flip) |
| 182 | Jump Game I / II | Greedy reachability / BFS-like levels |
| 183 | Partition Equal Subset Sum | Subset-sum, bitset or boolean DP |
| 184 | Target Sum | Transform into subset-sum |
| 185 | Perfect Squares | `dp[n]` = min squares summing to n |

### 2-D DP

| # | Problem | State |
|---|---|---|
| 186 | Unique Paths I / II | `dp[i][j]` = paths to cell |
| 187 | Minimum Path Sum | `dp[i][j]` = min cost to cell |
| 188 | Longest Common Subsequence | `dp[i][j]` = LCS of prefixes |
| 189 | Edit Distance | `dp[i][j]` = ops to convert prefixes |
| 190 | Distinct Subsequences | `dp[i][j]` = ways s[:i] forms t[:j] |
| 191 | Interleaving String | `dp[i][j]` = can s1[:i], s2[:j] interleave to s3[:i+j] |
| 192 | Longest Palindromic Substring | Expand around centre (O(n²), O(1) space) or DP |
| 193 | Longest Palindromic Subsequence | LCS of s and reverse(s) |
| 194 | Palindrome Partitioning II | Min cuts |
| 195 | Regular Expression Matching | `dp[i][j]` with `*` handling |
| 196 | Wildcard Matching | Similar |
| 197 | Burst Balloons | Interval DP — think "last balloon burst" |
| 198 | Matrix Chain Multiplication | Classic interval DP |
| 199 | Best Time to Buy/Sell Stock I–IV, with Cooldown, with Fee | State machine DP |
| 200 | 0/1 Knapsack | `dp[i][w]` — the canonical one |
| 201 | Unbounded Knapsack | Same, but reuse items (iterate weight forward) |
| 202 | Longest Common Substring | Like LCS but reset on mismatch |
| 203 | Cherry Pickup | 3-D / two-agent DP |
| 204 | Dungeon Game | Work backwards from the end |

**Stock problems are one family, not six.** Model them as a state machine: `hold[i]` and `free[i]`, with transitions between them, adding a transaction count or a cooldown as needed. Solving one gives you all of them.

**The knapsack space optimisation:** for 0/1 knapsack, iterate weight *downward* so each item is used once; for unbounded, iterate *upward* so it can be reused. That one line is the whole difference and it's a favourite follow-up.

**Burst Balloons insight:** thinking "which balloon do I burst first" gives a state you can't define, because the array changes. Thinking "which balloon do I burst *last* in this interval" gives clean subproblems. **The reframe is the entire problem.**

---

## 15.12 Pattern 11 — Backtracking

**Template:**
```
def backtrack(path, choices):
    if is_solution(path): record(path); return
    for choice in choices:
        if not valid(choice): continue
        path.append(choice)
        backtrack(path, updated_choices)
        path.pop()              # undo
```

| # | Problem | Notes |
|---|---|---|
| 205 | Subsets / Subsets II | II needs sorting + duplicate skipping |
| 206 | Permutations / Permutations II | Used array; skip duplicates at the same depth |
| 207 | Combinations | Start index to avoid repeats |
| 208 | Combination Sum I / II / III | I reuses, II doesn't, III has a count constraint |
| 209 | Letter Combinations of a Phone Number | Cartesian product |
| 210 | Generate Parentheses | Track open/close counts |
| 211 | Palindrome Partitioning | Partition + palindrome check (memoise it) |
| 212 | Word Search | DFS on a grid with in-place marking |
| 213 | Word Search II | **Trie + DFS** — the key optimisation |
| 214 | N-Queens | Diagonal sets for O(1) conflict checks |
| 215 | Sudoku Solver | Constraint propagation + backtracking |
| 216 | Restore IP Addresses | Partition into 4 valid octets |
| 217 | Matchsticks to Square | Sort descending, prune |
| 218 | Partition to K Equal Sum Subsets | Bitmask DP alternative |

**Pruning is what's actually being tested in the hard ones.** N-Queens without diagonal sets is O(n!) with an O(n) check per placement; with sets it's the same asymptotics but dramatically faster, and more importantly it shows you think about the constant factor. Word Search II without a trie times out — the trie prunes whole branches when no word has that prefix.

---

## 15.13 Pattern 12 — Greedy

| # | Problem | Greedy choice |
|---|---|---|
| 219 | Jump Game | Track furthest reachable |
| 220 | Jump Game II | Level-by-level furthest reach |
| 221 | Gas Station | If total ≥ 0 a solution exists; restart at the failure point |
| 222 | Merge Intervals | Sort by start, merge overlaps |
| 223 | Insert Interval | Three phases: before, merge, after |
| 224 | Non-overlapping Intervals | Sort by **end**, keep earliest-ending |
| 225 | Minimum Arrows to Burst Balloons | Same as above |
| 226 | Meeting Rooms I / II | Sort; II uses a heap |
| 227 | Task Scheduler | Most frequent task determines the schedule |
| 228 | Partition Labels | Extend to the last occurrence |
| 229 | Candy | Two passes, left to right then right to left |
| 230 | Queue Reconstruction by Height | Sort desc by height, insert at index k |
| 231 | Best Time to Buy and Sell Stock II | Take every upward move |
| 232 | Assign Cookies | Sort both, two pointers |
| 233 | Huffman Coding | Repeatedly merge the two smallest |

**"Sort by end time" is the interval-scheduling insight.** For maximising the number of non-overlapping intervals, always keep the one that finishes earliest — it leaves the most room. Be able to *argue* why (exchange argument), because "greedy works here" needs justification and interviewers ask for it.

**When is greedy valid?** When the problem has the greedy-choice property (a local optimum is part of a global optimum) and optimal substructure. If you can't argue those, use DP. Saying "I can't prove the greedy is correct here, so I'll use DP" is a strong answer.

---

## 15.14 Pattern 13 — Tries, Bit Manipulation, Math, Design

### Tries
| # | Problem |
|---|---|
| 234 | Implement Trie (prefix tree) |
| 235 | Design Add and Search Words (with `.` wildcard) |
| 236 | Word Search II |
| 237 | Replace Words |
| 238 | Maximum XOR of Two Numbers in an Array (binary trie) |
| 239 | Search Suggestions System |

### Bit manipulation
| # | Problem | Trick |
|---|---|---|
| 240 | Single Number | XOR everything |
| 241 | Single Number II | Bit counting mod 3, or two-mask state machine |
| 242 | Single Number III | XOR all, isolate a differing bit, partition |
| 243 | Number of 1 Bits | `n & (n-1)` clears the lowest set bit |
| 244 | Counting Bits | `dp[i] = dp[i >> 1] + (i & 1)` |
| 245 | Reverse Bits | Bit-by-bit, or divide and conquer |
| 246 | Missing Number | XOR, or Gauss sum |
| 247 | Sum of Two Integers (no +) | XOR for sum, AND<<1 for carry, loop |
| 248 | Subsets via bitmask | Iterate 0..2ⁿ−1 |
| 249 | Bitwise AND of Numbers Range | Common prefix |

**Know these four identities cold:** `n & (n-1)` clears the lowest set bit; `n & -n` isolates it; `x ^ x = 0`; `x ^ 0 = x`. They solve most bit problems.

### Math
| # | Problem |
|---|---|
| 250 | Pow(x, n) — fast exponentiation |
| 251 | Sqrt(x) |
| 252 | Excel Sheet Column Number/Title |
| 253 | Roman to Integer / Integer to Roman |
| 254 | Count Primes (Sieve of Eratosthenes) |
| 255 | Happy Number |
| 256 | Ugly Number II |
| 257 | Rotate Image (in place: transpose + reverse) |
| 258 | Spiral Matrix |
| 259 | Set Matrix Zeroes (O(1) space using first row/column) |
| 260 | Product of Array Except Self (prefix × suffix, no division) |

### Design
| # | Problem |
|---|---|
| 261 | LRU Cache |
| 262 | LFU Cache |
| 263 | Min Stack |
| 264 | Design Twitter (heap merge of followees' feeds) |
| 265 | Design Hit Counter (circular buffer or deque) |
| 266 | Design Rate Limiter — **this is your scheduler** |
| 267 | Design Underground System (map of trips) |
| 268 | Design Browser History (two stacks, or a doubly linked list) |
| 269 | Snapshot Array (per-index list of (snapId, value) + binary search) |
| 270 | Design Search Autocomplete (trie + top-k) |

**Design questions are your best DSA category**, because you can bring real experience. When asked to design a rate limiter, you're not reasoning from first principles — you built one. Say so, then discuss the algorithm choice and atomicity (Chapter 09 §E).

---

## 15.15 Pattern 14 — Matrix and simulation

| # | Problem |
|---|---|
| 271 | Rotate Image |
| 272 | Spiral Matrix I / II |
| 273 | Set Matrix Zeroes |
| 274 | Game of Life (in-place with encoded states) |
| 275 | Valid Sudoku |
| 276 | Diagonal Traverse |
| 277 | Search a 2D Matrix I / II |
| 278 | Island Perimeter |
| 279 | Number of Islands II (Union-Find, dynamic) |
| 280 | Shortest Path in a Grid with Obstacles Elimination (BFS with state) |

**Game of Life in place** is a good one: encode both the old and new state in one integer (e.g. bit 0 = old, bit 1 = new), then shift at the end. It tests whether you think about space, not just correctness.

---

## 15.16 What to do when you're stuck (memorise this ladder)

1. **Write a tiny example by hand** and solve it manually. Watch what your brain does — that's often the algorithm.
2. **Solve a simpler version.** k=1 instead of general k. Unsorted instead of sorted. One dimension instead of two.
3. **Name the waste.** What am I recomputing? What am I re-scanning? Every optimisation is the removal of a specific redundancy.
4. **Try the data structure ladder:** would a hash map help? a heap? a stack? a set? sorting first?
5. **Consider the reverse direction.** Many problems (Dungeon Game, Trapping Rain Water, Burst Balloons) are much easier backwards.
6. **Ask for a hint.** After 60 seconds of genuine blankness, asking is strictly better than silence.

---

## 15.17 Language-specific notes for Go and Java

Your resume lists both. If you interview in Go, know:
- No built-in heap type — `container/heap` requires implementing five methods. **Practise writing it**, or you'll lose five minutes in the interview.
- No built-in set — `map[T]struct{}`.
- Sorting: `sort.Slice(s, func(i, j int) bool { ... })`.
- Strings are immutable byte slices; `[]rune(s)` for Unicode-correct indexing.
- Integer division truncates toward zero; `%` can be negative.

If you interview in Java:
- `PriorityQueue` is a min-heap; reverse with a comparator.
- `HashMap.getOrDefault`, `computeIfAbsent`, `merge` save a lot of lines.
- `int` overflows silently — use `long` for sums.
- `Arrays.sort` on primitives is dual-pivot quicksort (O(n²) worst-case, and there are adversarial inputs); on objects it's TimSort (stable, O(n log n) guaranteed).

**Pick one language and stay in it.** Switching mid-preparation costs you fluency, and fluency is what saves you under time pressure. Given your background, Go is the natural choice unless the company mandates otherwise.

---

*Next: [Chapter 16 — Core CS: OS, DBMS, Networks](16-CORE-CS-OS-DBMS-CN.md)*
