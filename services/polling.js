const icy = require('icy');
const { Observable, combineLatest, timer, of } = require('rxjs');
const { map, pairwise, exhaustMap, takeUntil, filter, distinctUntilChanged, tap, finalize, switchMap, share } = require('rxjs/operators');
const { isEqual } = require('lodash');
const state = require('./state');

const nonStreamingClientUrls$ = combineLatest([
    state.currentClientUrls$,
    state.currentStreamingUrls$
]).pipe(
    map(([clientUrls, streamingUrls]) => clientUrls.filter(c => !streamingUrls.includes(c))),
    distinctUntilChanged((x,y) => isEqual(x,y)),
    share()
);
const nonStreamingClientUrlsAdded$ = nonStreamingClientUrls$.pipe(
    pairwise(),
    map(([previous, current]) => current.filter(c => !previous.includes(c))),
    filter(n => n.length > 0),
    share()
)
const nonStreamingClientUrlsRemoved$ = nonStreamingClientUrls$.pipe(
    pairwise(),
    map(([previous, current]) => previous.filter(p => !current.includes(p))),
    filter(n => n.length > 0),
    share()
)

/* TODO Is it bad to 'subscribe within a subscribe' like this?  Would it be better for this
to be a nested observable? */
nonStreamingClientUrlsAdded$.subscribe(urls => {
    urls.forEach(url => pollStationOnInterval(url, 60000).subscribe(meta => state.notifyMetadataReceived(url, meta)))
})

const pollStationOnInterval = (url, interval) => timer(0, interval).pipe(
    exhaustMap(() => getCurrentMetadata(url)),
    takeUntil(nonStreamingClientUrlsRemoved$.pipe(
        filter(removed => removed.includes(url)),
    ))
)

const getCurrentMetadata = (url) => Observable.create(observer => {
    const request = icy.request(url, icyResponse => {
        icyResponse.resume();

        icyResponse.on('metadata', (metadata) => {
            var parsed = icy.parse(metadata);
            icyResponse.destroy();

            observer.next(parsed.StreamTitle);
            observer.complete();
        });

        icyResponse.on('error', error => console.error('error caught', error));
    });
    request.on('error', (err) => {
        /* TODO Should we do something to communicate to the client in some way that
        the fetch failed?  Does it matter?  What would we do with that information? */
        observer.complete();
    });
    request.end();
})