import { Component } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Item } from './classes';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
    itemCollection: AngularFirestoreCollection;
    items: Observable<any[]>;
    addItemValue: string;

    constructor(db: AngularFirestore) {
        this.addItemValue = "";
        this.itemCollection = db.collection('items');
        this.items = db.collection('items').valueChanges({ idField: 'id' });
        this.items.forEach(item => {
            console.log(item);
        });
    }

    addItemUpdate(event: any) {
        if (/[^a-zA-Z ]/.test(event.target.value)) {
            event.target.value = this.addItemValue;
        } else {
            this.addItemValue = event.target.value;
        }
    }

    addItemKeyUp(event: KeyboardEvent) {
        if (event.keyCode == 13) {
            this.addItemSubmit();
        }
    }

    addItemSubmit() {
        let clean = this.addItemValue.trim();
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
}
