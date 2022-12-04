# React Fetch On Scroll

A zero dependency React hook for fetching data when scroll reaches the end of data. It makes sure that the call to callback function is done only once when container component is visible.

### Options:

* **offset:** Offset from the bottom of container. It just places the tracker component at given offset of bottom. Supported formats are: 200px, 20%, 20vh, 20cm.
* **shouldStop:** Used to stop fetching when done. If provided true, then the callback function will not be executed.
* **onLoadMore:** Callback function to run when tracker component is visible on screen. This function should return a promise.

```ts
export default function App() {
  const [list, setList] = useState([...Array(11).keys()])
  const { containerRef, isLoading } = useInfiniteScroll({
    async onLoadMore() {
      const res = await fetchList(list.slice(-1)[0])
      setList(list.concat(res))
    },
  })
  return (
    <div className="App">
      <List>
        {list.map((n) => (
          <Item key={n}>{n}</Item>
        ))}
        {isLoading && <Loading>Loading ...</Loading>}
        <div ref={containerRef} />
      </List>
    </div>
  )
}
```

### Return type:

* **containerRef:** A reference function used to set as `ref` in the element for which you want to track and get data when visible. It can be either used in a container or can be used in an element added at last of container.

* **isLoading:** A boolean value to keep track if data is being loaded.
