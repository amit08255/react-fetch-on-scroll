/* eslint-disable no-param-reassign */

/**
React hook for fetching data when scroll reaches the end. It makes sure that the call to callback function is done only once when container component is visible.

Options:
* offset: Offset from the bottom of container. It just places the tracker component at given offset of bottom. Supported formats are: 200px, 20%, 20vh, 20cm.
* shouldStop: Used to stop fetching when done. If provided true, then the callback function will not be executed.
* onLoadMore: Callback function to run when tracker component is visible on screen. This function should return a promise.

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
      </List>
      <div ref={containerRef} />
    </div>
  )
}
*/

import {
    LegacyRef, useEffect, useRef, useState,
} from 'react';

type Options = {
    offset?: string;
    shouldStop?: boolean;
    onLoadMore?: () => Promise<void>;
};

type Ref = {
    observer: IntersectionObserver,
    top: number,
    container: HTMLElement|null,
}

function useInfiniteScroll(options?: Options) {
    const { offset = '0px', shouldStop = false, onLoadMore } = options ?? {};

    const [isLoading, setIsLoading] = useState(false);

    const ref = useRef<Ref>({
        observer: null, top: -1, container: null,
    });

    const targetRef = useRef(document.createElement('div'));

    const containerRef: LegacyRef<HTMLElement> = (container) => {
        if (container) {
            ref.current.container = container;
            container.append(targetRef.current);
            container.style.position = 'relative';
        }
    };

    useEffect(() => {
        const target = targetRef.current;
        target.toggleAttribute('data-infinite-scroll-detector', true);
        target.style.position = 'absolute';
        target.style.bottom = offset;
        if (target.offsetTop < 0) target.style.bottom = '0px';
    }, [offset, isLoading]);

    useEffect(() => {
        const observe = ref.current.observer;
        if (observe) {
            observe.disconnect();
        }

        async function handler([{ isIntersecting }]: IntersectionObserverEntry[]) {
            const { container, top } = ref.current;

            if (isIntersecting && container && top === container.offsetTop) {
                return;
            }

            ref.current.top = -1;

            if (
                isIntersecting
                && !isLoading
                && !shouldStop
                && typeof onLoadMore === 'function'
            ) {
                setIsLoading(true);
                await onLoadMore();
                setIsLoading(false);
                ref.current.top = container ? container.offsetTop : 0;
            }
        }

        ref.current.observer = new IntersectionObserver(
            handler as IntersectionObserverCallback,
            { threshold: 0 },
        );

        ref.current.observer.observe(targetRef.current);

        return () => observe?.disconnect();
    }, [isLoading, onLoadMore, shouldStop]);

    return {
        isLoading,
        containerRef,
    };
}

export default useInfiniteScroll;
