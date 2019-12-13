import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map, first } from 'rxjs/operators';
import { Item } from './classes';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    itemCollection: AngularFirestoreCollection;
    items: Observable<any[]>;
    itemsFlat: any[];
    loading: boolean = true;
    addItemValue: string;
    editing: string;

    constructor(private db: AngularFirestore) {
        this.addItemValue = "";
        this.itemCollection = db.collection('items');
        this.items = db.collection('items')
          .valueChanges({ idField: 'id' })
          .pipe(map((items: {id: string, name: string}[]) => items.sort((a, b) => {return a.name > b.name ? 1 : -1})));
        this.items.subscribe((items) => console.log(items));
        this.items.subscribe((items) => this.itemsFlat = items);
        this.items.pipe(first()).subscribe(() => this.loading = false);
    }

    ngOnInit() {
        // keep focus in the input field
        document.querySelector('.addItem').addEventListener('focusout', (event) => setTimeout(() => {document.querySelector('.addItem').focus()}, 0))
    }

    addItemUpdate(event) {
        if (/[^a-zA-Z0-9 ]/.test(event.target.value)) {
            event.target.value = this.addItemValue;
        } else {
            this.addItemValue = event.target.value;
        }
    }

    addItemKeyUp(event: KeyboardEvent) {
        if (event.key == "Enter") {
            if (this.editing) {
                let clean = this.addItemValue.trim().replace(/ +/g, " ");
                if (clean) {
                    this.updItem(this.editing, clean);
                    this.addItemValue = "";
                }
                this.editing = null;
            } else {
                this.addItemSubmit();
            }
        }
        if (event.key == "Escape") {
            this.editing = null;
            this.addItemValue = "";
        }
    }

    addItemSubmit() {
        let clean = this.addItemValue.trim().replace(/ +/g, " ");
        if (clean) {
            this.addItem(clean);
            this.addItemValue = "";
        }
    }

    addItem(name: string) {
        this.itemCollection.add({ name: name });
    }

    remItem(id: string) {
        this.itemCollection.doc(id).delete();
    }

    updItem(id: string, item) {
        this.db.doc(`${"items"}/${id}`).update({name: item});
    }

    clickItem(event, id: string) {
        if (event.ctrlKey) {
            this.remItem(id);
        } else {
            if (this.editing != id) {
                this.editing = id;
                this.addItemValue = this.itemByID(id).name;
                // this.addItemValue = this.itemsFlat.find((item) => item.id == id).name;
            } else {
                this.editing = null;
                this.addItemValue = "";
            }
        }
    }

    itemByID(id: string) {
        return this.itemsFlat.find((item) => item.id == id);
    }
}
