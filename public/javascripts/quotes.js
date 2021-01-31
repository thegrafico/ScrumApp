const QUOTES = [
    "Your limitation—it’s only your imagination.",
    "Push yourself, because no one else is going to do it for you.",
    "Sometimes later becomes never. Do it now.",
    "Great things never come from comfort zones.",
    "Dream it. Wish it. Do it.",
    "Success doesn’t just find you. You have to go out and get it.",
    "The harder you work for something, the greater you’ll feel when you achieve it.",
    "Dream bigger. Do bigger.",
    "Dream bigger. Do bigger.",
    "Wake up with determination. Go to bed with satisfaction.",
    "Do something today that your future self will thank you for.",
    "Little things make big days.",
    "Little things make big days.",
    "Don’t wait for opportunity. Create it.",
    "Sometimes we’re tested not to show our weaknesses, but to discover our strengths.",
    "Dream it. Believe it. Build it.",
];

const quoteID = "#quote-span";

$(function() {
    // set the text of the span to be the random quote
    $(quoteID).text(getRandomQuote())
});


/** get a quote from the QUOTE array
 * @return {String} - return a quote
 */
function getRandomQuote() {

    // get a random index between 0 and len(QUOTES)
    let indx = Math.floor(Math.random() * QUOTES.length) + 1

    // return quote string
    return QUOTES[indx]
}